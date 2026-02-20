// Simple anonymization utility for the prototype.
// Exports anonymize(text) => { text, replacements: [{ original, tag }] }

export function anonymize(text) {
  if (!text) return { text: "", replacements: [] };
  let out = text;
  const replacements = [];

  // Helper to register replacement and return tag
  function rep(matched, tag) {
    replacements.push({ original: matched, tag });
    return tag;
  }

  // 1) Documents and identifiers: CPF, RG, CNS, CRM, prontuário patterns (process first to avoid misclassification)
  const cpfRe = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g;
  out = out.replace(cpfRe, (m) => rep(m, "[DOCUMENTO]"));

  const rgRe = /\b\d{1,2}\.\d{3}\.\d{3}-[0-9Xx]\b/g;
  out = out.replace(rgRe, (m) => rep(m, "[DOCUMENTO]"));

  const cnsRe = /\b\d{15}\b/g;
  out = out.replace(cnsRe, (m) => rep(m, "[DOCUMENTO]"));

  const crmRe = /\bCRM(?:-[A-Z]{2})?\s*\d+\b/gi;
  out = out.replace(crmRe, (m) => rep(m, "[DOCUMENTO]"));

  // hospital registration numbers like HG-2025-009874 or similar
  const regnumRe = /\b[A-Z]{1,4}-\d{3,6}-\d{3,}\b/g;
  out = out.replace(regnumRe, (m) => rep(m, "[DOCUMENTO]"));

  // 2) Contacts: emails, urls, phones
  const emailRe = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
  out = out.replace(emailRe, (m) => rep(m, "[CONTATO]"));

  const urlRe = /https?:\/\/\S+/gi;
  out = out.replace(urlRe, (m) => rep(m, "[CONTATO]"));

  const wwwRe = /www\.\S+/gi;
  out = out.replace(wwwRe, (m) => rep(m, "[CONTATO]"));

  const phoneRe = /(?:\+?\d{1,3}\s?)?(?:\(?\d{2}\)?\s?)?(?:9?\d{4})-?\d{4}/g;
  out = out.replace(phoneRe, (m) => rep(m, "[CONTATO]"));

  // 3) Medical staff titles (Dr, Dra, Prof., Médico) -> [EQUIPE_MEDICA]
  const doctorRe = /\b(?:Dr(?:\.|a)?|Dra(?:\.|)?|Prof(?:\.|)|Médico|Medico)\s+[A-ZÀ-Ý][\wÀ-ÿ]+(?:\s+[A-ZÀ-Ý][\wÀ-ÿ]+){0,2}\b/g;
  out = out.replace(doctorRe, (m) => rep(m, "[EQUIPE_MEDICA]"));

  // 4) Institutions & schools (EMEI, UBS, Hospital, Escola, Colégio, Clínica)
  const instRe = /\b(EMEI|UBS|Hospital|Cl(?:í|i)nica|Escola|Colégio|Centro Educacional|Creche|EMEF|Instituto|Casa de Saúde|Santa Casa)\b[^\n,]{0,80}/gi;
  out = out.replace(instRe, (m) => rep(m, "[INSTITUICAO]"));

  // 5) Context-based location anchors (mora em, residente na, Rua, Av., nº, Bairro)
  const locationAnchors = /\b(?:mora(?:ndo)? em|reside(?:m)? na|residente na|morador de|endereço[:\s]|endereco[:\s]|rua|r\.|avenida|av\.|bairro|bairro[:\s]|nº|no\.?)\s*([^\.,\n]{3,120})/gi;
  out = out.replace(locationAnchors, (m, g1) => {
    // only mark as location if captured text contains letters (avoid pure numeric IDs)
    if (g1 && /[A-Za-zÀ-ÿ]/.test(g1)) return rep(g1, "[LOCALIZACAO]");
    return m;
  });

  // 6) People detection by context: 'Paciente:', 'filho de', 'mãe', 'pai', 'nome:'
  const personContextRe = /\b(?:Paciente[:\s]|Paciente\s|nome[:\s]|nome completo[:\s]|filho de|filha de|mãe de|pai de|parente[:\s])\s*([A-ZÀ-Ý][\wà-ÿ]+(?:\s+[A-ZÀ-Ý][\wà-ÿ]+){0,3})/gi;
  out = out.replace(personContextRe, (m, g1) => rep(g1, "[PACIENTE]"));

  // 7) As a last resort, replace remaining standalone full names cautiously:
  // sequences of 2-3 capitalized words that are not headings.
  const nameSeq = /\b([A-ZÀ-Ý][a-zà-ÿ]+(?:\s+[A-ZÀ-Ý][a-zà-ÿ]+){1,3})\b/g;
  out = out.replace(nameSeq, (m) => {
    // ignore common headings
    const headings = ["Queixa Principal", "História da Moléstia Atual", "Historia da Moléstia Atual", "Exame Físico", "Conduta", "Atendimento por", "Endereço", "Telefone"];
    if (headings.includes(m)) return m;
    // skip tokens that look like institutions (they were replaced earlier)
    if (m.startsWith("[") && m.endsWith("]")) return m;
    return rep(m, "[PACIENTE]");
  });

  return { text: out, replacements };
}

export default anonymize;

