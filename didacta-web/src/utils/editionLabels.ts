export function getLabels(level: string) {
    const isCare = level === 'MATERNAL' || level === 'INICIAL';
    return {
        sessionLabel: isCare ? 'Jornada' : 'Clase',
        sessionLabelPlural: isCare ? 'Jornadas' : 'Clases',
        studentLabel: isCare ? 'Niño' : 'Alumno',
        studentLabelPlural: isCare ? 'Niños' : 'Alumnos',
    };
}
