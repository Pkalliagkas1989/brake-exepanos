// Level registry: returns the spec object for a given level number.
import { BootSector } from './Level01_BootSector.js';
import { SystemCache } from './Level02_SystemCache.js';
import { Firewall } from './Level03_Firewall.js';
import { MemoryLane } from './Level04_MemoryLane.js';
import { GlitchZone } from './Level05_GlitchZone.js';
import { VirusVault } from './Level06_VirusVault.js';
import { Recompiler } from './Level07_Recompiler.js';
import { EncryptionChamber } from './Level08_EncryptionChamber.js';
import { FragmentCore } from './Level09_FragmentCore.js';
import { TheSentinel } from './Level10_Sentinel.js';

export function levelSpec(n) {
  const specs = {
    1: BootSector,
    2: SystemCache,
    3: Firewall,
    4: MemoryLane,
    5: GlitchZone,
    6: VirusVault,
    7: Recompiler,
    8: EncryptionChamber,
    9: FragmentCore,
    10: TheSentinel,
  };
  const f = specs[n] ?? BootSector;
  return f();
}
