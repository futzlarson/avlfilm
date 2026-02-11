import * as approval from './approval';
import * as backupAlert from './backup-alert';
import * as eventSubmission from './event-submission';
import * as filmmakerSubmission from './filmmaker-submission';
import * as passwordReset from './password-reset';
import * as productionCompanySubmission from './production-company-submission';
import * as requestFile from './request-file';

export const emails = {
  // External
  approval,
  passwordReset,
  requestFile,
  // Internal
  backupAlert,
  eventSubmission,
  filmmakerSubmission,
  productionCompanySubmission,
};

export type EmailType = keyof typeof emails;
