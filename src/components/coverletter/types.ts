export interface CoverLetterData {
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  senderLocation: string;
  date: string;
  recipientName: string;
  recipientTitle: string;
  companyName: string;
  companyAddress: string;
  jobTitle: string;
  salutation: string;
  openingParagraph: string;
  bodyParagraph: string;
  closingParagraph: string;
  signOff: string;
}

function todayLabel(): string {
  return new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export const emptyCoverLetterData: CoverLetterData = {
  senderName: "",
  senderEmail: "",
  senderPhone: "",
  senderLocation: "",
  date: todayLabel(),
  recipientName: "",
  recipientTitle: "",
  companyName: "",
  companyAddress: "",
  jobTitle: "",
  salutation: "Yth. Bapak/Ibu Hiring Manager,",
  openingParagraph: "",
  bodyParagraph: "",
  closingParagraph: "",
  signOff: "Hormat saya,",
};
