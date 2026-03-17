# Features de Valor Agregado - EduFlow 360°

## Principio: La operación diaria genera evidencia automáticamente

La maestra no llena reportes extra. Simplemente usa EduFlow para su trabajo del día a día, y como efecto secundario la escuela tiene protección legal, los padres tienen visibilidad, y la dirección tiene alertas tempranas.

---

## MVP Features

### 1. Jornada en Vivo (Maternal)
**Problema:** Las cuidadoras llenan bitácoras al final del día (tarde e impreciso) o mandan fotos por WhatsApp (inseguro, sin registro).

**Solución:** Botones grandes de acción rápida durante el día: Alimento | Siesta | Pañal | Actividad | Incidente | Foto. Cada tap abre un mini-formulario de 15 segundos. Se acumula en timeline del niño visible para los padres.

**Complejidad:** Media | **Prioridad:** MVP

---

### 2. Ficha de Salud con Alertas
**Problema:** La maestra tiene 15-25 niños. Tres son alérgicos a algo diferente, uno es diabético. Memorizar todo es imposible. Un error = emergencia médica + demanda.

**Solución:** Cada alumno tiene ficha de salud (alergias, medicamentos, restricciones). Badge visible SIEMPRE que la maestra interactúa con el alumno. Al registrar alimentación → warning: "ALERTA: Sofía es alérgica al cacahuate".

**Complejidad:** Media | **Prioridad:** MVP

---

### 3. Entrega Segura (Safe Pickup)
**Problema:** La SEP exige que solo personas autorizadas recojan menores. Se maneja con papelitos y fotos impresas. Si la escuela entrega al niño equivocado → responsabilidad legal seria.

**Solución:** Registro de personas autorizadas con foto. Si el padre manda a alguien no registrado → autorización temporal desde la app con código QR de un solo uso. Log auditable de cada entrega.

**Entidades:** AuthorizedPickupPerson, PickupLog, TemporaryAuthorization

**Complejidad:** Media | **Prioridad:** MVP (es regulación, no feature)

---

### 4. Pase de Lista por Excepción
**Problema:** 25 taps diarios para marcar "presente" a cada alumno. Tedioso, muchas maestras lo hacen de memoria después.

**Solución:** Invertir el paradigma. Todos presentes por default, la maestra solo marca ausentes/retardos. De 25 taps a 2-3 taps. Confirmación al final: "22 presentes, 2 ausentes, 1 retardo".

**Complejidad:** Baja | **Prioridad:** MVP+

---

## Growth Features

### 5. Expediente Digital con Timeline
**Problema:** Padre reclama "nadie me dijo nada". La directora busca en cuadernos. Sin evidencia, la escuela pierde. Quejas ante PROFECO van en aumento.

**Solución:** Vista agregada automática por alumno: toda la historia (asistencia, sesiones, incidentes, fotos, mensajes) en una timeline. Se genera sola con data existente. Exportable a PDF.

**Complejidad:** Media | **Prioridad:** Growth

---

### 6. Firma Digital de Reglamento y Políticas
**Problema:** Papeles firmados al inicio de año que se pierden. PROFECO falla a favor de padres por falta de evidencia.

**Solución:** Documentos digitales con firma (checkbox + timestamp + IP). Dashboard: "87% de padres firmaron, faltan 12 familias". Recordatorios automáticos.

**Entidades:** PolicyDocument, ConsentSignature

**Complejidad:** Media | **Prioridad:** Growth

---

### 7. Alertas de Deserción
**Problema:** Perder 3-4 alumnos al semestre puede cerrar una escuela pequeña. La directora se entera cuando el papá llama para la baja.

**Solución:** 3+ faltas consecutivas → alerta automática a dirección: "Sofía Martínez - 4 inasistencias en 10 días - Tendencia: decreciente - Último contacto con padres: hace 15 días". Botón "Contactar familia" pre-llenado.

**Entidades:** AttendanceAlert

**Complejidad:** Media | **Prioridad:** Growth

---

### 8. Resumen Semanal "Mi Semana"
**Problema:** Los padres se saturan con notificaciones diarias o se desconectan por falta de contexto.

**Solución:** Cada viernes, resumen auto-generado por alumno: foto destacada, asistencia (5/5 días), actividades, observaciones. Es tan visual que los padres lo comparten → marketing orgánico.

**Complejidad:** Media | **Prioridad:** Growth

---

### 9. Comprobante Mensual de Servicios
**Problema:** Padre dice "pago 5,000 y no sé qué recibo". PROFECO obliga a detallar servicios incluidos.

**Solución:** Reporte mensual automático: días asistidos, sesiones tomadas, actividades, evidencia. No es factura, es "comprobante de servicios educativos prestados". Generado con data existente.

**Complejidad:** Baja | **Prioridad:** Growth

---

## Scale/Premium Features

### 10. Cumplimiento Protección Civil/SEP
**Problema:** Desde 2023, la SEP y Protección Civil cierran escuelas por no cumplir. Las directoras hacen todo a mano con Word y Excel.

**Solución:** Checklists pre-configurados: simulacros, capacitaciones, extintores, pólizas. Semáforo verde/amarillo/rojo. Aviso 30 días antes de vencimiento. PDF para presentar ante autoridades.

**Entidades:** ComplianceRequirement, ComplianceRecord

**Complejidad:** Media | **Prioridad:** Scale (feature premium)

---

## Modelo de Monetización

| Tier | Features | Target |
|------|----------|--------|
| **Gratis** | Pase de lista, asistencia básica, comunicación básica | Adopción masiva |
| **Básico** | Jornada en vivo, ficha de salud, entrega segura, expediente digital | La maestra necesita esto para operar |
| **Premium** | Alertas de deserción, resumen semanal, firma digital, comprobante de servicios, cumplimiento normativo | La directora ve el ROI y paga |
