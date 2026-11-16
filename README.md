# StudyMate

**An offline AI tutor for Ghanaian Senior High School (SHS) students, running on the phone.**

StudyMate helps SHS students understand their lessons and prepare for exams without needing internet data. The model runs on the device: no account is needed and no chat is sent to a cloud service.

A few optional features do use the internet, and only when someone switches them on: downloading models from Hugging Face, web search (your chosen search provider receives the query) and remote model servers. Both the model download and web search controls are locked behind an access code in Settings.

## Aim

Many students have a phone but limited or expensive internet access. StudyMate aims to put a patient, always-available tutor in their pocket:

- **Works offline.** Once the model is on the phone, no connection is needed to chat.
- **Built for modest phones.** The target is a small fine-tuned language model (Qwen3-0.6B, quantized to GGUF) that runs on Android phones with as little as 4 GB of RAM.
- **Made for the Ghana SHS curriculum.** Subjects include Mathematics, English, Integrated Science, Physics, Chemistry, Biology, Economics, Geography, Government, History, ICT, Financial Accounting, Business Management and Social Studies.
- **Teaches, not just answers.** The default tutor prompt explains step by step, uses everyday Ghanaian examples, checks understanding, and admits when it is unsure.

> **Status:** work in progress. The app shell and tutor behaviour are in place. The fine-tuned StudyMate model is still being trained and tested, and models are currently imported from the phone's storage. Curriculum search (RAG) is built, but the bundled notes file is empty until you add your curriculum (see [docs/RAG.md](docs/RAG.md)), so it does nothing yet.

## Acknowledgement and credit

StudyMate is a rebranded fork of **[PocketPal AI](https://github.com/a-ghorbani/pocketpal-ai)** by **[a-ghorbani](https://github.com/a-ghorbani)** and its contributors. PocketPal provides the foundation of this app: the React Native chat interface, model management, and on-device inference. Huge thanks to the PocketPal team for building it and releasing it as open source.

PocketPal AI is MIT-licensed. The original [LICENSE](LICENSE) and copyright notice are kept unchanged, as the license requires. StudyMate is not affiliated with or endorsed by the PocketPal AI project.

PocketPal in turn builds on the open-source community, including [llama.cpp](https://github.com/ggml-org/llama.cpp), [llama.rn](https://github.com/mybigday/llama.rn), [whisper.cpp](https://github.com/ggml-org/whisper.cpp), [React Native](https://reactnative.dev/), [MobX](https://mobx.js.org/), [React Native Paper](https://callstack.github.io/react-native-paper/), [React Navigation](https://reactnavigation.org/) and [WatermelonDB](https://github.com/Nozbe/WatermelonDB).

## What is different from PocketPal

- **Rebranded** as StudyMate, with Android package ID `com.benwalker.studymate`.
- **Default tutor prompt.** When no Pal is active and the model has no system prompt of its own, StudyMate uses a tutor prompt for Ghanaian SHS students (`src/utils/studymatePrompt.ts`).
- **Locked settings.** Advanced settings, model downloads and Internet Search are greyed out in Settings and open with an access code, so students don't change them by accident. This is a convenience guard, not security: the code ships inside the app.
- **Curriculum search (RAG).** Matching curriculum passages are added to the prompt for each question (`src/rag/`). The notes file is empty until you generate one.
- **Firebase is not used.** Upstream used Firebase App Check only to send optional benchmarks and feedback online. StudyMate stubs this out in JavaScript (`src/utils/fb.ts`). Upstream's native Firebase libraries are still compiled in and start with the app, so the Android build still applies the Google Services plugin and includes a **placeholder** `android/app/google-services.json` for `com.benwalker.studymate`. It contains no real Firebase project. The clean-up is to remove the `@react-native-firebase` packages, the plugin and that file together.
- **Local models.** Models are imported from the phone's storage; downloading from Hugging Face is available under Advanced settings.

Everything else, such as Pals, voice features and remote servers, is inherited from PocketPal and still present in the code.

## For developers

StudyMate is a standard React Native app (TypeScript).

**Prerequisites**

- Node.js, with the version pinned in [`.nvmrc`](.nvmrc) (`nvm use`)
- Yarn 1 (Classic)
- Android Studio with the Android SDK and NDK

**Run it**

```bash
git clone https://github.com/ahiadzubernard1234-sudo/pocketpal-ai
cd pocketpal-ai
git checkout studymate-rebrand

nvm use
yarn install

yarn start      # Metro bundler
yarn android    # build and run on an Android device or emulator
```

**Quality checks**

```bash
yarn lint
yarn typecheck
yarn test
```

If you change `package.json`, a native module, or anything under `android/`, rebuild the app; a JS reload will not pick the change up.

### Use your own model

1. Copy your GGUF file (for example `Qwen3-0.6B-Q4_K_M.gguf`) to the phone.
2. In the app, open **Models**, tap **+**, and choose the local file.
3. Load the model and start chatting.

### Known follow-ups

- App icon and splash images still use PocketPal artwork (binary assets, to be replaced).
- iOS name and bundle ID have not been changed yet.
- The first-run onboarding still offers PocketPal's sample Pals and model downloads.
- The Android E2E tests (`e2e/`) and the E2E workflow (`.github/workflows/e2e-tests.yml`) still refer to the old `com.pocketpalai` package. The Play Store upload lane now names `com.benwalker.studymate` but needs its own Play Console listing and key before it can be used.
- Some existing tests (Settings, Models, chat session) still expect PocketPal's behaviour and need updating for the locks and the default prompt.
- New Settings text is English only and is not yet in `src/locales/en.json`.

## License

MIT. See [LICENSE](LICENSE). The original copyright notice from PocketPal AI is retained.
