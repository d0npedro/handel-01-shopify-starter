type ReleaseInput = {
  version: string;
  testsPassed: boolean;
  artifacts: string[];
};

export function verifyRelease(input: ReleaseInput): string[] {
  const findings: string[] = [];

  if (!/^\d+\.\d+\.\d+$/.test(input.version)) {
    findings.push("Version muss dem Schema MAJOR.MINOR.PATCH entsprechen.");
  }

  if (!input.testsPassed) {
    findings.push("Tests sind noch nicht erfolgreich abgeschlossen.");
  }

  if (input.artifacts.length === 0) {
    findings.push("Mindestens ein Release-Artefakt fehlt.");
  }

  return findings;
}
