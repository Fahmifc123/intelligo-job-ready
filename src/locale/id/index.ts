import signIn from './sign-in-locale'
import admin from './admin-locale'
import shared from './shared-locale'
import dialog from './dialog-locale'
import labels from './labels-locale'
import message from './message-locale'
import cvAnalysis from './cv-analysis-locale'



const localeId = {
  translation: {
    shared: shared,
    dialog: dialog,
    labels: labels,
    message: message,
    signIn: signIn,
    admin: admin,
    cvAnalysis: cvAnalysis,
  }
}

export default {
  language: 'id',
  country: 'id',
  name: 'Indonesia',
  embeddedLocale: localeId
}