import { auth } from '../firebase/config';

export const testFirebaseConnection = () => {
  console.log('Firebase Auth instance:', auth);
  console.log('Firebase App:', auth.app);
  console.log('Project ID:', auth.app.options.projectId);
  return auth.app.options.projectId !== undefined;
};