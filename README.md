# StudyMate

**An offline AI tutor for Ghanaian Senior High School (SHS) students, running entirely on the phone.**

StudyMate helps SHS students understand their lessons and prepare for exams without needing internet data. Everything runs on the device: no account, no cloud, and no data leaving the phone.

## Aim

Many students have a phone but limited or expensive internet access. StudyMate aims to put a patient, always-available tutor in their pocket:

- **Works offline.** Once the model is on the phone, no connection is needed.
- **Built for modest phones.** The target is a small fine-tuned language model (Qwen3-0.6B, quantized to GGUF) that runs on Android phones with as little as 4 GB of RAM.
- **Made for the Ghana SHS curriculum.** Subjects include Mathematics, English, Integrated Science, Physics, Chemistry, Biology, Economics, Geography, Government, History, ICT, Financial Accounting, Business Management and Social Studies.
- **Teaches, not just answers.** The default tutor prompt explains step by step, uses everyday Ghanaian examples, checks understanding, and admits when it is unsure.

> **Status:** work in progress. The app shell and tutor behaviour are in place; the fine-tuned StudyMate model is still being trained and tested, and models are currently imported locally from the phone's storage.

## Acknowledgement and credit

StudyMate is a rebranded fork of **[PocketPal AI](https://github.com/a-ghorbani/pocketpal-ai)** by **[a-ghorbani](https://github.com/a-ghorbani)** and its contributors. PocketPal provides the foundation of this app: the React Native chat interface, model management, and on-device inference. Huge thanks to the PocketPal team for building it and releasing it as open source.

PocketPal AI is MIT-licensed. The original [LICENSE](LICENSE) and copyright notice are kept unchanged, as the license requires. StudyMate is not affiliated with or endorsed by the PocketPal AI project.

PocketPal in turn builds on the open-source community, including [llama.cpp](https://github.com/ggml-org/llama.cpp), [llama.rn](https://github.com/mybigday/llama.rn), [whisper.cpp](https://github.com/ggml-org/whisper.cpp), [React Native](https://reactnative.dev/), [MobX](https://mobx.js.org/), [React Native Paper](https://callstack.github.io/react-native-paper/), [React Navigation](https://reactnavigation.org/) and [WatermelonDB](https://github.com/Nozbe/WatermelonDB).

## What is different from PocketPal

- **Rebranded** as StudyMate, with Android package ID `com.benwalker.studymate`.
- **Default tutor prompt.** When no Pal is active and the model has no system prompt of its own, StudyMate uses a tutor prompt for Ghanaian SHS students (`src/utils/studymatePrompt.ts`).
- **Advanced model settings are locked.** They are greyed out in Settings and open with an access code, so students don't change them by accident. This is a convenience guard, not security.
- **Firebase removed.** Upstream used Firebase App Check only to send optional benchmarks and feedback online. StudyMate stubs this out (`src/utils/fb.ts`) and does not need `google-services.json`.
- **Local models.** Models are imported from the phone's storage for now.

Everything else, such as Pals, voice features and Hugging Face downloads, is inherited from PocketPal and still present in the code.

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
- Some existing tests need updating for the locked Advanced settings and the new default prompt.
- `@react-native-firebase` packages are still listed in `package.json`; see the note in `android/app/build.gradle`.

## License

MIT. See [LICENSE](LICENSE). The original copyright notice from PocketPal AI is retained.
