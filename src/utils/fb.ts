/**
 * Firebase App Check has been removed from StudyMate.
 *
 * Upstream PocketPal used Firebase only to attach an App Check token when
 * submitting benchmarks and feedback to Hugging Face Spaces. StudyMate does not
 * use those online features, so these are inert stand-ins that keep the existing
 * imports (src/api/benchmark.ts, src/api/feedback.ts) working without pulling
 * in @react-native-firebase.
 *
 * Both callers already wrap these calls in try/catch and carry on without a
 * token, so rejecting from getAppCheckToken is safe.
 */

export const initializeAppCheck = async (): Promise<void> => {
  // Intentionally a no-op.
};

export const getAppCheckToken = async (): Promise<string> => {
  throw new Error('Firebase App Check is not available in StudyMate');
};
