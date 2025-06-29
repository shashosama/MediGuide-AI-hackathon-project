

// Symptom → Department mapping helper
function diagnoseSymptom(symptom: string): string {
  const mapping: { [key: string]: string } = {
    "chest pain": "Cardiology",
    "shortness of breath": "Pulmonology",
    rash: "Dermatology",
    fever: "General Medicine",
    headache: "Neurology",
  };

  for (const keyword in mapping) {
    if (symptom.toLowerCase().includes(keyword)) {
      return mapping[keyword];
    }
  }

  return "General Medicine";
}

// Main conversation function
export async function createConversation(userSymptomText: string) {
  // Use diagnoseSymptom helper
  const department = diagnoseSymptom(userSymptomText);

  // Example of returning or sending a response
  const responseText = `Based on your symptoms, please visit our ${department} department.`;

  console.log(responseText);

  // Here you would actually send this text back via Tavus API / Tool Call / Text Respond
  return responseText;
}
