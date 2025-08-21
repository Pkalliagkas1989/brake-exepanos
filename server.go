// Minimal static server with explicit Content-Type for ES modules.
// Run: go run serve.go -port 8080   (from the folder containing index.html)
package main

import (
	"compress/gzip"
	"flag"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

func main() {
	var (
		dir    string
		port   string
		cache  string
		gzipOn bool
	)
	flag.StringVar(&dir, "dir", ".", "directory to serve")
	flag.StringVar(&port, "port", "8000", "port to listen on")
	flag.StringVar(&cache, "cache", "no-store", `Cache-Control header (e.g. "no-store" or "public,max-age=31536000,immutable")`)
	flag.BoolVar(&gzipOn, "gzip", true, "enable gzip compression for text/js/css/html/json/svg")
	flag.Parse()

	root, err := filepath.Abs(dir)
	if err != nil {
		log.Fatalf("resolve dir: %v", err)
	}
	if _, err := os.Stat(root); err != nil {
		log.Fatalf("dir not found: %s", root)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		code := 200
		defer func() {
			log.Printf("%3d %7s %s (%s)", code, r.Method, r.URL.Path, time.Since(start))
		}()

		// Normalize path
		path := r.URL.Path
		if path == "/" || path == "/index" {
			path = "/index.html"
		}
		clean := filepath.Clean("/" + path)
		fsPath := filepath.Join(root, filepath.FromSlash(clean))

		// Block traversal
		rel, err := filepath.Rel(root, fsPath)
		if err != nil || strings.HasPrefix(rel, "..") {
			code = http.StatusBadRequest
			http.Error(w, "bad path", code)
			return
		}

		// If directory, try index.html
		fi, err := os.Stat(fsPath)
		if err == nil && fi.IsDir() {
			fsPath = filepath.Join(fsPath, "index.html")
		}

		f, err := os.Open(fsPath)
		if err != nil {
			code = http.StatusNotFound
			http.NotFound(w, r)
			return
		}
		defer f.Close()

		// Re-stat
		fi, err = f.Stat()
		if err != nil || fi.IsDir() {
			code = http.StatusNotFound
			http.NotFound(w, r)
			return
		}

		// Headers before body
		ct := contentTypeFor(fsPath)
		if ct != "" {
			w.Header().Set("Content-Type", ct)
		}
		if cache != "" {
			w.Header().Set("Cache-Control", cache)
		}
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Vary", "Accept-Encoding")
		w.Header().Set("X-Served-By", "breakout-exe-go")

		// Gzip
		doGzip := gzipOn && compressible(fsPath) && strings.Contains(r.Header.Get("Accept-Encoding"), "gzip")
		var out io.Writer = w
		if doGzip {
			w.Header().Set("Content-Encoding", "gzip")
			gzw := gzip.NewWriter(w)
			defer gzw.Close()
			out = gzw
		}

		// HEAD: headers only
		if r.Method == http.MethodHead {
			w.WriteHeader(code)
			return
		}

		w.WriteHeader(code)
		_, _ = io.Copy(out, f)
	})

	addr := ":" + port
	log.Printf("Serving %s on http://localhost%s", root, addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}

func contentTypeFor(p string) string {
	p = strings.ToLower(p)
	switch {
	case strings.HasSuffix(p, ".js"), strings.HasSuffix(p, ".mjs"):
		return "text/javascript; charset=utf-8"
	case strings.HasSuffix(p, ".css"):
		return "text/css; charset=utf-8"
	case strings.HasSuffix(p, ".html"), strings.HasSuffix(p, ".htm"):
		return "text/html; charset=utf-8"
	case strings.HasSuffix(p, ".json"):
		return "application/json; charset=utf-8"
	case strings.HasSuffix(p, ".svg"):
		return "image/svg+xml"
	case strings.HasSuffix(p, ".txt"):
		return "text/plain; charset=utf-8"
	default:
		return "application/octet-stream"
	}
}

func compressible(p string) bool {
	p = strings.ToLower(p)
	switch {
	case strings.HasSuffix(p, ".html"),
		strings.HasSuffix(p, ".htm"),
		strings.HasSuffix(p, ".js"),
		strings.HasSuffix(p, ".mjs"),
		strings.HasSuffix(p, ".css"),
		strings.HasSuffix(p, ".svg"),
		strings.HasSuffix(p, ".json"),
		strings.HasSuffix(p, ".txt"):
		return true
	default:
		return false
	}
}
