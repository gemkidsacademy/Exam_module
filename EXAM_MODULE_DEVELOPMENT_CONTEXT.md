# Exam Module Development Context

> **Scope and evidence.** This document records the implementation present in this repository as inspected on 2026-08-31. It describes active code reachable from `src/App.js`, plus clearly identified supporting artifacts. The backend is external and is not present in this repository. Backend storage, models, authorization middleware, and side effects are therefore documented only where the frontend proves them. Paths in braces (for example, `{student_id}`) are runtime values.

## 1. Module Overview

The Exam Module is a Create React App frontend for Gem Kids Academy. It provides:

- A shared login for `SUPER_ADMIN`, `CENTER_ADMIN`, `CENTER_TEACHER`, and `STUDENT` users.
- Student practice exams, homework, reports, and question review for Selective, OC, NAPLAN, and Foundational programs.
- Selective and OC subjects: Thinking Skills, Mathematical Reasoning, Reading, and Writing.
- NAPLAN subjects: Numeracy, Language Conventions, Reading, and Writing.
- Timed attempts, answer navigation, visited/flagged state, automatic submission, reports, attempt history, and AI-generated explanations.
- Administration for centers, center users, students, classes/class years, question uploads, question-bank configuration, exam generation, reports, readiness reports, leaderboard, and Word-document cleaning.

Main flows are:

1. Login -> role/class dispatch -> admin panel or student dashboard.
2. Student mode selection (`exam`, `homework`, or historical report) -> subject availability -> welcome/instructions -> subject-specific attempt component -> external API -> report/review.
3. Admin tab -> select exam family/subject -> configure a quiz or generate an exam -> external API.
4. Admin report tab -> select center/student/class/exam/date -> external reporting API -> rendered/printable report, optionally emailed as a generated PDF.

The frontend owns UI state and orchestration. The external API owns identity validation, available exams, attempt persistence/resume, timers returned at start, scoring, reports, question banks, generation, and administrative persistence. Google Cloud Storage serves question images; Firebase is used only to host the compiled SPA.

## 2. Frontend Project Structure

```text
Exam Module/
├── package.json                 CRA scripts and dependencies
├── firebase.json                Firebase Hosting -> build/ with SPA rewrite
├── postcss.config.js            Tailwind + Autoprefixer
├── tailwind.config.js           scans src/**/*.{js,jsx,ts,tsx}
├── public/                      CRA static shell, manifest, icons
├── build/                       generated production output (not source)
└── src/
    ├── index.js                 React 19 root; StrictMode; renders App
    ├── App.js                   login, session bootstrap, routes, route guard
    ├── App.css/index.css/...    global and feature CSS
    ├── hooks/useVariant.js      URL/fallback/default writing variant resolver
    └── components/
        ├── AdminPage.js         role-filtered admin tab shell and feature composition
        ├── SelectiveDashboard.js / OCDashboard.js / NaplanDashboard.js
        │                        student mode/subject state machines
        ├── Foundational_dashboard.js
        │                        single Foundational welcome/instructions flow
        ├── ExamPageThinkingSkills.js / ExamPageMathematicalReasoning.js
        ├── ReadingComponent.js / ExamPageWriting.js
        │                        Selective attempt/report/review implementations
        ├── ExamPageOcThinkingSkills.js / ExamPageOCMathematicalReasoning.js
        ├── ReadingComponentOC.js / ExamPageOCwriting.js
        │                        OC implementations
        ├── NaplanNumeracy.js / NaplanLanguageConventions.js
        ├── NaplanReading.js / NaplanWriting.js
        │                        NAPLAN implementations
        ├── ExamPageFoundational.js
        │                        Foundational section lifecycle
        ├── *Review.js           load and render stored question-level reviews
        ├── QuizSetup*.js        create configs, inspect/reset/delete question-bank data
        ├── GenerateExam*.js     create active/homework exams from random/latest banks
        ├── UploadWord*.js       multipart Word question uploads
        ├── UploadImageFolder.js image-folder upload/list
        ├── CenterManagement.js  center/admin/teacher CRUD selector
        ├── ManageClasses.js / ManageClassYears.js
        ├── AddUserForm.js / EditUserForm.js / ViewUserModal.js /
        │   DeleteUserModal.js / BulkUserUpload.js
        ├── StudentExamReports.js / StudentReportShell_backend.js
        ├── SelectiveReadinessOverall.js / OCReadinessOverall.js
        ├── Leaderboard.js / ExamCleaner.js
        └── feature CSS and report/presentation children
```

### Important files and responsibilities

| File | Responsibility / exports | Depends on / used by | Backend use |
|---|---|---|---|
| `src/index.js` | Creates React root and renders default `App`. | Browser entry point. | None. |
| `src/App.js` | `LoginPage`, `PrivateRoute`, `FullWidthLayout`, default `App`. Stores login state and dispatches by role/class. | Owns all routes. | `POST /login-exam-module`. |
| `src/components/AdminPage.js` | Default `AdminPanel`; composes all active admin features as tabs and subflows. | `/adminpanel`. | Children call APIs directly. |
| `src/components/SelectiveDashboard.js` | Selective mode/subject/welcome/instruction flow. | `/SelectiveDashboard`. | Subject availability. |
| `src/components/OCDashboard.js` | OC mode/subject flow. | `/OCDashboard`. | OC subject availability. |
| `src/components/NaplanDashboard.js` | NAPLAN mode/subject flow. | `/NAPLAN`. | NAPLAN subject availability. |
| `src/components/Foundational_dashboard.js` | Foundational selection -> welcome -> instructions -> exam. | `/selectiveFoundational`. | Child only. |
| `src/components/ExamPageThinkingSkills.js` | Selective TS start/resume, timer, answers, submit, report, review. | `SelectiveDashboard`. | TS attempt/report/review and explanation APIs. |
| `src/components/ExamPageMathematicalReasoning.js` | Selective MR equivalent, keyed by exam IDs/dates. | `SelectiveDashboard`. | MR APIs. |
| `src/components/ReadingComponent.js` | Flattens reading `exam_json.sections`, attempt/report/review UI. | `SelectiveDashboard`. | Selective Reading APIs. |
| `src/components/ExamPageWriting.js` | Rich-text writing attempt, timer, submit, rubric result/history. | `SelectiveDashboard`. | Shared writing APIs. |
| `src/components/ExamPageOcThinkingSkills.js`, `ExamPageOCMathematicalReasoning.js`, `ReadingComponentOC.js`, `ExamPageOCwriting.js` | OC counterparts with OC endpoint families. | `OCDashboard`. | OC APIs. |
| `src/components/NaplanNumeracy.js`, `NaplanLanguageConventions.js`, `NaplanReading.js`, `NaplanWriting.js` | NAPLAN subject attempts/reports/reviews. | `NaplanDashboard`. | NAPLAN APIs. |
| `src/components/ExamPageFoundational.js` | Multi-section Foundational attempt and report. | `Foundational_dashboard`. | Hard-coded Railway API. |
| `src/components/QuizSetup*.js` | Controlled setup forms, topic/count/bank lookup, question cleanup, active/homework config creation. | `AdminPage` create-exam tab. | Question/config endpoints. |
| `src/components/GenerateExam*.js` | Select upload date/batch/class year and generate random/latest active or homework exam. | `AdminPage` generate-exam tab. | Generation endpoints. |
| `src/components/StudentReportShell_backend.js` | Student/class/cumulative report filter orchestration. | Admin topic-report tab. | Reporting endpoints. |
| `src/hooks/useVariant.js` | Returns `?variant=` first, then prop, then `"actual"`. | Writing implementations. | None. |

There is **no centralized service/API directory**, no React Context, Redux, Zustand, Firebase client, shared Axios instance, or typed model layer. Components and their local handlers are the effective service layer.

## 3. Frontend Architecture and Data Flow

### General flow

```text
click/change/submit
-> dashboard or feature component local state
-> component-local async handler/useEffect
-> fetch or axios to REACT_APP_API_URL (or a hard-coded URL)
-> external backend / Google Cloud Storage
-> parsed JSON
-> local setState
-> conditional React rendering
```

State is almost entirely `useState`; `useEffect` triggers availability, start/resume, report/history, and dependent-option requests. `useRef` guards duplicate starts/submissions and stores printable DOM nodes. `useMemo` derives normalized reports/prompts. No state survives component unmount except selected identity values in `sessionStorage` and history state/query parameters.

Forms are controlled inputs. Validation consists of HTML `required`, explicit empty-field guards, allowed-range checks in setup forms, disabled buttons, and backend validation errors (`detail`, `message`, or raw text). There is no schema-validation library.

Loading/error handling is per component: booleans such as `loading`, `submitting`, `availabilityLoading`, and `loadingReport`; inline messages, `alert`, `console.error`, or early returns. No error boundary or global notification mechanism exists.

Styling mixes global CSS files, CSS Modules for some exam shells, Tailwind utility classes in newer admin CRUD components, and inline styles. UI components are not organized into a shared design system.

### Login flow

`LoginPage.handleLogin` -> `POST /login-exam-module` with `{student_id, password}`, JSON, and `credentials: "include"` -> response fields `session_token`, `user_type`, `center_code`, `name`, and for students `student_id`, `class_name` -> state plus `sessionStorage` -> navigate by role/program. The token is retained only in `App` state and is not attached as an Authorization header. Subsequent calls rely on explicit identity parameters and, if enforced server-side, the login cookie.

### Student exam flow

Dashboard button -> `examMode`/`reportVariant` and `examPhase` -> availability GET -> subject -> welcome/instructions (skipped for report) -> subject component. Attempt components call a start/resume POST, store returned questions/attempt identifier/remaining time, update local answer maps while navigating, and submit all answers in one POST. The backend returns or exposes report IDs/data; the component changes `mode` to `report`. Review children fetch question-level data for the selected attempt.

Typical answer maps are `{ [questionId]: optionKey }`. Flags and visited state are UI-only and are not submitted. Timers count down client-side from backend-provided `remaining_time`/`remaining_seconds`; reaching zero invokes the same finish function. Most components use refs to prevent duplicate submission.

### Admin flow

`AdminPanel` filters tabs from `userType`; selecting a tab mounts a feature. Setup/generation pages fetch dependent lists (classes, years, dates, batches, topics, counts), validate local state, then submit JSON or multipart data. Successful mutations commonly `alert`, reset form state, or refetch the list.

## 4. Backend / API Dependency Map

### Contract conventions

- Unless explicitly noted, the base is `process.env.REACT_APP_API_URL`.
- Omitted `fetch.method` means `GET`. JSON mutations set `Content-Type: application/json`. Upload/email endpoints use `FormData` and deliberately omit that header.
- Only login sets `credentials: "include"`; no active request adds `Authorization`.
- Response descriptions below list fields actually read by the frontend. Other fields may exist but cannot be confirmed here.
- There are no named frontend service functions. The listed component handler/effect is the API caller.

### Authentication, identity, center, class, and user administration

| Method | Endpoint | Purpose / caller | Request | Observed response/use |
|---|---|---|---|---|
| POST | `/login-exam-module` | `LoginPage.handleLogin` | JSON `{student_id,password}`, cookie credentials | `session_token,user_type,center_code,name,student_id,class_name`; `detail` on error. |
| GET | `/centers/get-next-center-code` | `AddCenter.fetchNextCenterCode` | None | `center_code`. |
| POST | `/centers/add-center` | `AddCenter.handleSubmit` | Center JSON including code/name/contact/address/time zone/status | Success/error detail; reset form. |
| GET | `/centers/get-all-centers` | center/admin/teacher CRUD | None | `{centers:[...]}`. |
| PUT | `/centers/update-center/{centerCode}` | `EditCenter` | Updated center JSON | Message/detail. |
| DELETE | `/centers/delete-center/{centerCode}` | `DeleteCenter` | Path ID | Message/detail; refetch. |
| POST | `/center-admin/add-center-admin` | `AddCenterAdmin` | center, name, username/password, email, phone | Message/detail. |
| GET | `/center-admin/get-all-center-admins` | view/edit/delete admin | None | `{admins:[{id,center_code,full_name,email,phone_number,username}]}`. |
| PUT | `/center-admin/update-center-admin/{id}` | `EditCenterAdmin` | Updated admin JSON | Message/detail. |
| DELETE | `/center-admin/delete-center-admin/{id}` | `DeleteCenterAdmin` | Path ID | Message/detail. |
| POST | `/center-teacher/add-center-teacher` | `AddCenterTeacher` | `{center_code,full_name,username,password,email,phone_number}` | Message/detail. |
| GET | `/center-teacher/get-all-center-teachers` | view/edit/delete teacher | None | Teacher list (shape consumed by CRUD forms). |
| PUT | `/center-teacher/update-center-teacher/{id}` | `EditCenterTeacher` | Updated teacher JSON | Message/detail. |
| DELETE | `/center-teacher/delete-center-teacher/{id}` | `DeleteCenterTeacher` | Path ID | Message/detail. |
| GET | `/classes/{centerCode}` | user/class forms | Center path | Array of class records. |
| POST | `/classes` | `AddClassForm` | `{center_code,class_name,...}` as implemented | Message/detail. |
| PUT | `/classes/{id}` | `EditClassForm` | Updated class JSON | Message/detail. |
| DELETE | `/classes/{id}` | `DeleteClass` | Path ID | Message/detail. |
| GET | `/class-years-exam-module` | class-year CRUD | optional `center_code`, `class_name` query | Class-year records. |
| POST | `/class-years-exam-module` | `AddClassYear` (Axios) | Class-year JSON | Axios success/error. |
| PUT | `/class-years-exam-module/{id}` | `EditClassYear` | Updated year JSON | Success/error. |
| DELETE | `/class-years-exam-module/{id}` | `DeleteClassYear` | Path ID | Success/error. |
| GET | `/get_next_user_id_exam_module` | `AddUserForm` | None | next ID. |
| POST | `/add_student_exam_module` | `AddUserForm` | Student identity/class/year/day/parent email/center JSON | Message/detail. |
| GET | `/get_all_students_exam_module` | `ViewUserModal`/delete/edit flows | filters vary by component | Student array. |
| PUT | `/edit_student_exam_module` | `EditUserForm` | Updated student JSON | Message/detail. |
| DELETE | `/delete_student_exam_module/{id}` | `DeleteUserModal` | Path ID | Message/detail. |
| POST | `/api/admin/bulk-users-exam-module` | `BulkUserUpload` | Multipart CSV | Backend message/detail. |
| POST | `/api/admin/delete-exam-attempt-2` | `DeleteUserExamAttempt` | JSON selecting student/category/subject/attempt | Result/detail; component supports lookup/delete phases. |

### Availability, start, finish, report, and review

| Method | Exact endpoint(s) | Purpose / main consumer | Request | Observed response/use |
|---|---|---|---|---|
| GET | `/api/student/available-subjects` | Selective dashboard availability | `mode,student_id` query | Object keyed by subject; drives disabled/available UI. |
| GET | `/api/student/oc-available-subjects` | OC availability | `mode,student_id` | Subject availability object. |
| GET | `/api/student/available-subjects-naplan` | NAPLAN availability | `student_id` | Subject availability object. |
| POST | `/api/student/start-exam-thinkingskills`<br>`/api/student/start-homework-thinkingskills` | Selective TS start/resume | `{student_id}` | `completed,exam_attempt_id,questions,remaining_time`. |
| POST | `/api/student/finish-exam/thinking-skills`<br>`/api/student/finish-homework-thinkingskills` | Selective TS submit | `{student_id,exam_attempt_id,answers}` | Body not consumed; report then reloaded. |
| GET | `/api/student/exam-attempts/thinking-skills`<br>`/api/student/homework-attempts/thinking-skills` | TS attempt picker | `student_id` | Attempt array with `exam_attempt_id,completed_at`. |
| GET | `/api/student/exam-report/thinking-skills`<br>`/api/student/homework-report/thinking-skills` | TS report | `student_id`, optional `exam_attempt_id` | Report incl. `exam_attempt_id`; report component consumes scoring/topic fields. |
| GET | `/api/student/exam-review/thinking-skills`<br>`/api/student/homework-review/thinking-skills` | `ThinkingSkillsReview` | `student_id,exam_attempt_id` | `questions`. |
| POST | `/api/student/start-exam`<br>`/api/student/start-homework-mr` | Selective MR start/resume | `{student_id}` | `completed,questions,remaining_time`. |
| POST | `/api/student/finish-exam`<br>`/api/student/finish-homework-math-reasoning` | Selective MR submit | `{student_id,answers}` | Success; dates/report reloaded. |
| GET | `/api/student/exam-dates/mathematical-reasoning`<br>`/api/student/homework-dates/mathematical-reasoning` | MR history selector | `student_id` | `[{exam_id,date,...}]`. |
| GET | `/api/student/exam-report/mathematical-reasoning`<br>`/api/student/homework-report/mathematical-reasoning` | MR report | `student_id,exam_id` | Report object. |
| GET | `/api/student/exam-review/mathematical-reasoning`<br>`/api/student/homework-review/mathematical-reasoning` | `MathematicalReasoningReview` | `student_id,exam_id` | `questions`. |
| POST | `/api/exams/start-reading`<br>`/api/student/start-homework-reading` | Selective Reading start | `{student_id}` | `completed,attempt_id,exam_id,remaining_time`. |
| GET | `/api/exams/reading-content/{exam_id}`<br>`/api/student/homework-reading-content/{exam_id}` | Reading content | Path exam ID | `exam_json.sections`; sections/questions/options/passages. |
| POST | `/api/exams/submit-reading`<br>`/api/student/submit-homework-reading` | Reading submit | `{student_id,attempt_id,answers}` (component-selected fields) | Attempt/report transition. |
| GET | `/api/student/exam-dates/reading`<br>`/api/student/homework-dates/reading` | Reading history | `student_id` | Array with `exam_id,session_id,date`. |
| GET | `/api/student/exam-report/reading`<br>`/api/student/homework-report/reading` | Reading report by exam | `student_id,exam_id` | Overall/topic report. |
| GET | `/api/exams/reading-report`<br>`/api/student/homework-report-by-session` | Reading report by session | `session_id` | Overall/topic report. |
| GET | `/api/student/exam-review/reading`<br>`/api/student/homework-review/reading` | Reading review by exam | `student_id,exam_id` | `questions`. |
| GET | `/api/exams/review-reading`<br>`/api/student/homework-review-by-session/reading` | Reading review by session | `session_id` | `questions` with answer/options/section references. |
| POST | `/api/student/start-exam-oc-thinking-skills`<br>`/api/student/start-homework-oc-thinking-skills` | OC TS start | `{student_id}` | `completed,questions,remaining_time`. |
| POST | `/api/student/finish-exam/oc-thinking-skills`<br>`/api/student/submit-homework-oc-thinking-skills` | OC TS submit | `{student_id,answers}` | Report transition. |
| GET | `/api/student/exam-attempts/oc-thinking-skills`<br>`/api/student/homework-attempts/oc-thinking-skills` | OC TS attempts | `student_id` | Attempt array. |
| GET | `/api/student/exam-report/oc-thinking-skills`<br>`/api/student/homework-report/oc-thinking-skills` | OC TS report | `student_id`, optional `exam_attempt_id` | Report plus current attempt ID. |
| GET | `/api/student/exam-review/oc-thinking-skills`<br>`/api/student/homework-review/oc-thinking-skills` | OC TS review | IDs in query | `questions`. |
| POST | `/api/student/start-exam-oc-mathematical-reasoning`<br>`/api/student/start-homework-oc-mathematical-reasoning` | OC MR start | `{student_id}` | `completed,questions,remaining_time`. |
| POST | `/api/student/finish-exam-oc-mathematical-reasoning`<br>`/api/student/finish-homework-oc-mathematical-reasoning` | OC MR submit | `{student_id,answers}` | `attempt_id` used to select report. |
| GET | `/api/student/exam-attempts/oc-mathematical-reasoning`<br>`/api/student/homework-attempts/oc-mathematical-reasoning` | OC MR attempts | `student_id` | `{attempts:[{attempt_id,completed_at,...}]}`. |
| GET | `/api/student/exam-report/oc-mathematical-reasoning`<br>`/api/student/homework-report/oc-mathematical-reasoning` | OC MR report | `student_id`, optional `attempt_id` | Report. |
| GET | `/api/student/exam-review/oc-mathematical-reasoning`<br>`/api/student/homework-review/oc-mathematical-reasoning` | OC MR review | IDs in query | `questions`. |
| POST | `/api/exams/start-oc-reading`<br>`/api/exams/start-oc-reading-homework` | OC Reading start | `{student_id}` | `completed,attempt_id,exam_id,remaining_time`. |
| GET | `/api/exams/reading-content/{exam_id}`<br>`/api/exams/reading-content-homework/{exam_id}` | OC Reading content | Path exam ID | `exam_json.sections`. |
| POST | `/api/exams/submit-oc-reading`<br>`/api/exams/submit-oc-reading-homework` | OC Reading submit | student/attempt/answers JSON | Attempt/report transition. |
| GET | `/api/exams/oc-reading-attempts`<br>`/api/exams/oc-reading-homework-attempts` | OC Reading attempts | `student_id` | `{attempts:[{session_id,...}]}`. |
| GET | `/api/exams/oc-reading-report`<br>`/api/exams/oc-reading-homework-report` | OC Reading report | `session_id` | `overall,topics,improvement_order,has_sufficient_data`. |
| GET | `/api/exams/review-oc-reading`<br>`/api/exams/review-oc-reading-homework` | OC Reading review | `session_id` | `questions` incl. answer correctness. |
| POST | `/api/student/start-writing-exam`<br>`/api/student/start-oc-writing-exam`<br>`/api/student/start-naplan-writing-exam` | Start writing by program | `student_id` query | Start result logged; current endpoint supplies exam. |
| GET | `/api/exams/writing/current`<br>`/api/exams/oc-writing/current`<br>`/api/exams/naplan-writing/current` | Load/resume writing | `student_id` | `completed,exam,remaining_seconds`. |
| POST | `/api/student/start-homework-writing` | Start shared writing homework | `student_id` query | `completed,homework_id,remaining_time`. |
| GET | `/api/student/homework-writing-content/{homework_id}` | Writing homework prompt | path ID + `student_id` | `{exam}`. |
| POST | `/api/exams/writing/submit`<br>`/api/student/submit-homework-writing` | Submit writing | query `student_id`; `{answer_text,writing_type}` | Result data used to enter report/history. |
| GET | `/api/exams/writing/result`<br>`/api/student/homework-writing-report` | Latest writing result | `student_id` | Result/rubric; 404 means no result. |
| GET | `/api/exams/writing/result-by-attempt`<br>`/api/student/homework-writing-result-by-attempt` | Selected result | `attempt_id` | Result object. |
| GET | `/api/exams/writing/history-by-attempt`<br>`/api/student/homework-writing-history-by-attempt` | Writing snapshots/history | `attempt_id` | Array with `attempt_id,date,score,...`. |
| GET | `/api/exams/writing/review-by-attempt`<br>`/api/student/homework-writing-review-by-attempt` | `WritingReview` | `attempt_id` | Stored writing/rubric review. |
| GET | `/api/student/exam-report/foundational-skills` | Foundational report | `student_id` | Report. Hard-coded host. |
| POST | `/api/student/start-exam/foundational-skills` | Foundational start/resume | `{student_id}` | `completed,total_sections,current_section_index,section,remaining_time`. |
| POST | `/api/student/finish-exam/foundational-skills` | Foundational finish | `{student_id,answers,reason}` | Body unused; report reloaded. |
| POST | `/api/exams/foundational/next-section` | Advance section | `student_id` query | `completed` or next section/index/time fields. |

### NAPLAN objective-subject lifecycle

All starts/finishes are JSON POSTs with `student_id` and, on finish, `answers`. Dates/reports/reviews are GETs using `student_id` and `exam_id`.

| Subject | Start / homework start | Finish / homework finish | Dates / homework dates | Report / homework report | Review / homework review |
|---|---|---|---|---|---|
| Numeracy | `/api/student/start-exam/naplan-numeracy`<br>`/api/student/start-homework-exam/naplan-numeracy` | `/api/student/finish-exam/naplan-numeracy`<br>`/api/student/finish-homework-exam/naplan-numeracy` | `/api/student/exam-dates/naplan-numeracy`<br>`/api/student/exam-dates/naplan-numeracy-homework` | `/api/student/exam-report/naplan-numeracy`<br>`/api/student/exam-report/naplan-numeracy-homework` | `/api/student/exam-review/naplan-numeracy`<br>`/api/student/exam-review/naplan-numeracy-homework` |
| Language Conventions | `/api/student/start-exam/naplan-language-conventions`<br>`/api/student/start-homework/naplan-language-conventions` | `/api/student/finish-exam/naplan-language-conventions`<br>`/api/student/finish-homework-exam/naplan-language-conventions` | `/api/student/exam-dates/naplan-language-conventions`<br>`/api/student/exam-dates/naplan-language-conventions-homework` | `/api/student/exam-report/naplan-language-conventions`<br>`/api/student/exam-report/naplan-language-conventions-homework` | `/api/student/exam-review/naplan-language-conventions`<br>`/api/student/exam-review/naplan-language-conventions-homework` |
| Reading | `/api/student/start-exam/naplan-reading`<br>`/api/student/start-homework-exam/naplan-reading` | `/api/student/finish-exam/naplan-reading`<br>`/api/student/finish-homework-exam/naplan-reading` | `/api/student/exam-dates/naplan-reading`<br>`/api/student/exam-dates/naplan-reading-homework` | `/api/student/exam-report/naplan-reading`<br>`/api/student/exam-report/naplan-reading-homework` | `/api/student/exam-review/naplan-reading`<br>`/api/student/exam-review/naplan-reading-homework` |

`GET /api/student/profile?student_id={student_id}` is additionally used by `NaplanNumeracy` to read student profile/year context.

### AI explanations

| Method | Endpoint | Used by | Body / response |
|---|---|---|---|
| POST | `/api/ai/explain-question-TS` | TS, MR, OC variants, NAPLAN Numeracy/Language Conventions | Question blocks/options/correct answer -> `{explanation}`. |
| POST | `/api/ai/explain-question-selective-reading` | Selective/OC reading and reviews | question text/options/correct answer/passage -> `{explanation}`. |
| POST | `/api/ai/explain-question-naplan-reading` | `NaplanReading` | NAPLAN reading question context -> `{explanation}`. |

### Question setup and question-bank administration

All callers are active `QuizSetup*.js` components under the Admin create-exam tab. Query parameters are assembled from the selected program/subject, center, class year, difficulty, topic, date, and/or batch. Responses are arrays or objects whose observed fields include question IDs/previews, topics, counts, and configs.

| Method | Endpoint(s) | Capability |
|---|---|---|
| GET | `/api/question-count` | Count available questions for TS/MR/OC setup. |
| GET | `/api/topics`<br>`/api/topics-naplan`<br>`/api/topic/oc/math`<br>`/api/writing/topics` | Populate topic choices. |
| GET | `/api/topic-question-counts`<br>`/api/topic-question-counts-lc` | NAPLAN per-topic counts. |
| GET | `/api/reading-availability`<br>`/api/reading/topic-difficulties`<br>`/api/reading/topics`<br>`/api/reading/question-bank` | Selective/NAPLAN reading availability/bank lookup. |
| GET | `/api/reading-oc/topic-difficulties`<br>`/api/reading/topics-oc`<br>`/api/reading/question-bank-oc` | OC reading lookup. |
| GET | `/api/admin/question-bank-thinking-skills`<br>`/api/admin/question-bank-mathematical-reasoning`<br>`/api/admin/question-bank-oc-thinking-skills`<br>`/api/admin/question-bank-oc-mathematical-reasoning`<br>`/api/admin/question-bank/naplan`<br>`/api/admin/question-bank-reading/naplan` | Render available question banks. |
| GET | `/api/admin/search-questions-selective-ts`<br>`/api/admin/search-questions-selective-mr`<br>`/api/admin/search-questions-selective-reading`<br>`/api/admin/search-questions-oc-ts`<br>`/api/admin/search-questions-oc-mr`<br>`/api/admin/search-questions-oc-reading`<br>`/api/admin/search-questions-naplan`<br>`/api/admin/search-questions-naplan-reading`<br>`/api/admin/search-writing-questions` | Search questions before single deletion. |
| DELETE | `/api/admin/delete-question-selective-ts/{id}`<br>`/api/admin/delete-question-selective-mr/{id}`<br>`/api/admin/delete-question-selective-reading/{id}`<br>`/api/admin/delete-question-oc-ts/{id}`<br>`/api/admin/delete-question-oc-mr/{id}`<br>`/api/admin/delete-question-oc-reading/{id}`<br>`/api/admin/delete-question-naplan/{id}`<br>`/api/admin/delete-question-naplan-reading/{id}`<br>`/api/admin/delete-writing-question/{id}` | Delete one selected question. |
| DELETE | `/api/admin/delete-previous-questions-TS`<br>`/api/admin/delete-previous-questions-OC-TS`<br>`/api/admin/delete-all-questions-MR`<br>`/api/admin/delete-all-questions-OC-MR`<br>`/api/admin/delete-all-questions-selective-reading`<br>`/api/admin/delete-all-questions-oc-reading`<br>`/api/admin/delete-all-questions-naplan-numeracy`<br>`/api/admin/delete-all-questions-naplan-lc`<br>`/api/admin/delete-all-questions-naplan-reading`<br>`/api/admin/delete-writing-homework-questions` | Bulk cleanup. Some include query filters. |
| POST/PUT | `/api/admin/reset-used-questions`<br>`/api/admin/reset-used-questions-oc-mr`<br>`/api/admin/reset-used-reading-questions`<br>`/api/admin/reset-used-oc-reading-questions`<br>`/api/admin/reset-writing-questions`<br>`/api/admin/reuse-used-questions-naplan-numeracy`<br>`/api/admin/reuse-used-questions-naplan-language-conventions`<br>`/api/admin/reuse-used-questions-naplan-reading` | Mark previously used questions reusable/reset, with subject filters. NAPLAN reuse calls use `PUT`; reset calls are component-defined POST/DELETE operations. |
| POST | `/api/quizzes`<br>`/api/quizzes-homework` | Selective TS active/homework config. |
| POST | `/api/quizzes/mathematical-reasoning`<br>`/api/quizzes/mathematical-reasoning/homework` | Selective MR configs. |
| POST | `/api/admin/create-reading-config`<br>`/api/admin/create-reading-homework` | Selective Reading configs. |
| POST | `/api/quizzes-writing`<br>`/api/quizzes-writing-homework` | Writing configs; reused by Selective/OC/NAPLAN setup components. |
| POST | `/api/quizzes/oc-thinking-skills`<br>`/api/quizzes/oc-thinking-skills-homework` | OC TS configs. |
| POST | `/api/quizzes/oc-mathematical-reasoning`<br>`/api/quizzes/oc-mathematical-reasoning-homework` | OC MR configs. |
| POST | `/api/admin/create-reading-config`<br>`/api/admin/create-oc-reading-homework-config` | OC Reading active/homework configs (active endpoint is shared). |
| POST | `/api/quizzes-naplan-numeracy`<br>`/api/quizzes-naplan-homework` | NAPLAN Numeracy configs. |
| POST | `/api/quizzes-naplan-language-conventions`<br>`/api/quizzes-naplan-language-conventions-homework` | NAPLAN LC configs. |
| POST | `/api/quizzes-naplan-reading`<br>`/api/quizzes-naplan-reading-homework` | NAPLAN Reading configs. |
| GET/POST | `/api/topics-exam-setup`<br>`/api/quizzes-foundational` | Hard-coded-host Foundational topic lookup/config creation. |

### Exam generation

All generation mutations are `POST` JSON. Typical bodies contain `class_year`, `center_code`, and for latest mode `selected_date` and numeric `batch_id`; subject-specific fields are added by each component. Returned data is stored as `generatedExam` and displayed; exact backend model is not available.

| Lookup endpoints (GET) | Generation endpoints (POST) | Consumer |
|---|---|---|
| `/api/available-thinking-dates`<br>`/api/available-thinking-batches` | `/api/exams/generate-thinking-skills`<br>`/api/exams/generate-thinking-skills-latest`<br>`/api/exams/generate-thinking-skills-homework`<br>`/api/exams/generate-thinking-skills-homework-latest` | `GenerateExam_thinking_skills` |
| `/api/available-MR-dates`<br>`/api/available-mr-batches` | MR generation request is built in `GenerateExam.js`; inspect that handler before changing the contract. | `GenerateExam` |
| `/api/available-reading-dates`<br>`/api/available-reading-batches`<br>`/api/quizzes-reading` | `/api/exams/generate-reading`<br>`/api/exams/generate-reading-latest`<br>`/api/exams/generate-reading-homework`<br>`/api/exams/generate-reading-homework-latest` | `GenerateExam_reading` |
| `/api/writing/upload-dates/{classYear}`<br>`/api/writing/available-batches`<br>`/api/get-quizzes-writing` | `/api/exams/generate-writing`<br>`/api/exams/generate-writing-latest`<br>`/api/exams/generate-writing-homework`<br>`/api/exams/generate-writing-homework-latest` | `GenerateExam_writing` |
| `/api/foundational/classes` | `/api/exams/generate-foundational` | `GenerateExam_foundational` (hard-coded host) |
| `/api/exams/oc-thinking-skills-dates/{classYear}`<br>`/api/available-oc-thinking-batches` | `/api/exams/generate-oc-thinking-skills`<br>`/api/exams/generate-oc-thinking-skills-latest`<br>`/api/exams/generate-oc-thinking-skills-homework`<br>`/api/exams/generate-oc-thinking-skills-homework-latest` | `GenerateExam_oc_thinking_skills` |
| `/api/exams/oc-mathematical-reasoning-dates/{classYear}`<br>`/api/available-oc-mr-batches` | `/api/exams/generate-oc-mathematical-reasoning`<br>`/api/exams/generate-oc-mathematical-reasoning-latest`<br>`/api/exams/generate-oc-mathematical-reasoning-homework`<br>`/api/exams/generate-oc-mathematical-reasoning-homework-latest` | `GenerateExam_oc_mathematical_reasoning` |
| `/api/exams/oc-reading-dates/{classYear}`<br>`/api/available-oc-reading-batches` | `/api/exams/generate-oc-reading`<br>`/api/exams/generate-oc-reading-latest`<br>`/api/exams/generate-oc-reading-homework`<br>`/api/exams/generate-oc-reading-homework-latest` | `GenerateExam_oc_reading` |
| `/api/quizzes-writing/oc`<br>`/api/quizzes-oc-writing-homework` | `/api/exams/generate-oc-writing`<br>`/api/exams/generate-oc-writing-homework` | `GenerateExam_oc_writing` |
| `/naplan/numeracy/dates/{year}`<br>`/naplan/numeracy/available-batches` | `/naplan/numeracy/generate-exam`<br>`/naplan/numeracy/generate-exam-latest`<br>`/naplan/numeracy/generate-homework`<br>`/naplan/numeracy/generate-homework-latest` | `GenerateExam_naplan_numeracy` |
| `/naplan/language-conventions/dates/{year}`<br>`/naplan/language-conventions/available-batches` | `/naplan/language-conventions/generate-exam`<br>`/naplan/language-conventions/generate-exam-latest`<br>`/naplan/language-conventions/generate-homework`<br>`/naplan/language-conventions/generate-homework-latest` | `GenerateExam_naplan_language_conventions` |
| `/naplan/reading/upload-dates/{year}`<br>`/naplan/reading/available-batches` | `/naplan/reading/generate-exam`<br>`/naplan/reading/generate-exam-latest`<br>`/naplan/reading/generate-homework`<br>`/naplan/reading/generate-homework-latest` | `GenerateExam_naplan_reading` |
| `/class-years-exam-module?center_code=...` | `/api/exams/generate-naplan-writing`<br>`/api/exams/generate-naplan-writing-homework` | `GenerateExam_naplan_writing` |

### Upload, reporting, readiness, leaderboard, and utility endpoints

| Method | Endpoint | Purpose / consumer | Request / observed response |
|---|---|---|---|
| POST | `/upload-word-naplan` | Numeracy and LC Word upload | Multipart file plus metadata -> backend result/message. |
| POST | `/upload-word-naplan-reading` | NAPLAN Reading upload | Multipart -> result/message. |
| POST | `/upload-word-writing` | Writing upload | Multipart -> result/message. |
| POST | `/upload-image-folder` | `UploadImageFolder` | Multiple images multipart -> upload result. |
| GET | `/list-images` | `UploadImageFolder` | Image list. |
| POST | `/exam/clean-word-document` | `ExamCleaner` | Multipart `file` -> `{cleaned_text}`. |
| GET | `/api/admin/students_center_specific` | Admin reports/readiness | `center_code` -> student array. |
| GET | `/api/admin/oc-students` | OC readiness | `center_code` -> student array. |
| GET | `/api/admin/students/{studentId}` | `StudentExamReports` | Student object. |
| GET | `/api/admin/students/{studentId}/selective-report-dates`<br>`/api/admin/students/{studentId}/oc-report-dates` | Date selectors | Date arrays. |
| GET | `/api/admin/students/{studentId}/selective-reports` | Student report | `exam_date` -> report data. |
| POST | `/api/admin/students/{studentId}/overall-selective-report`<br>`/api/admin/students/{studentId}/overall-oc-report` | Overall readiness reports | `exam_date` -> `{components,...}` or backend error including possible missing subjects. |
| POST | `/api/admin/send-selective-report-email`<br>`/api/admin/send-oc-report-email` | Email generated PDF | Multipart `student_id,exam_date,file` -> message. |
| GET | `/api/exams/by-category` | Report exam options | `category` -> `{exams}`. |
| GET | `/api/classes/years` | Report class years | `category,center_code` -> `{years}`. |
| GET | `/api/students/class` | Student class lookup | `student_id` -> `{class_name}`. |
| GET | `/api/exams/available` | Student report exam list | `student_id` -> `{exams}`. |
| GET | `/api/exams/dates`<br>`/api/exams/dates/oc`<br>`/api/exams/dates/naplan` | Report attempt dates | `exam,student_id` -> `{dates}`. |
| GET | `/api/classes/{className}/exam-dates` | Class report dates | `exam,student_year,center_code` -> `{dates}`. |
| GET | `/api/reports/student`<br>`/api/reports/student/writing` | Single student report | student/exam/date/class query -> report object. |
| GET | `/api/reports/class` | Class report | class/year/center/exam/date -> report object. |
| GET | `/api/reports/student/cumulative` | Topic cumulative report | `student_id,exam,topic,attempt_dates[]` -> report; 400 is treated as no data. |
| GET | `/api/reports/student/cumulative/options` | Cumulative filter options | student/exam query -> available topics/dates. |
| GET | `/api/reports/student/writing/cumulative`<br>`/api/reports/student/cumulative-overall` | `CumulativeReport_new` variants | component query -> cumulative data. |
| POST | `/leaderboard/academic-years` | Leaderboard years | `{center_code}` -> years. |
| POST | `/leaderboard/academic-terms` | Terms | `{center_code,calendar_year}` -> terms. |
| POST | `/leaderboard/class-filters` | Filter values | center/year/term -> categories/years/days. |
| POST | `/leaderboard/sessions` | Session choices | center/term/filter body -> sessions. |
| POST | `/leaderboard` | Ranked result | selected filter body -> rows. |

## 5. Backend Endpoint Grouping

- **Authentication:** `/login-exam-module`.
- **Center tenancy:** `/centers/*`, `/center-admin/*`, `/center-teacher/*`.
- **Students/classes:** `/classes*`, `/class-years-exam-module*`, student CRUD and bulk upload.
- **Question ingestion:** `/upload-word-*`, `/upload-image-folder`, `/list-images`.
- **Question bank/configuration:** `/api/topics*`, `/api/question-count`, `/api/reading*`, `/api/admin/*question*`, `/api/quizzes*`.
- **Generation:** `/api/exams/generate-*` and `/naplan/{subject}/generate-*`, with date/batch lookups.
- **Attempts:** start/finish endpoints under `/api/student` or `/api/exams`.
- **Results/history/review:** report, dates/attempts, history, and review endpoint families.
- **Reporting/readiness:** `/api/reports/*` and `/api/admin/students/*report*`.
- **AI assistance:** `/api/ai/explain-question-*`.
- **Utilities:** leaderboard and `/exam/clean-word-document`.

## 6. Backend Reuse Guide

Before adding an endpoint, check these implemented capabilities:

| Capability | Existing API / frontend owner | Supported reuse boundary |
|---|---|---|
| Determine selectable subjects | Three `available-subjects` endpoints in the dashboards | Reuse for existing program/mode availability; do not assume it returns exam content. |
| Start/resume an attempt | Subject-specific `start-*` handler in the matching exam component | Reuse for the same program, subject, and active/homework mode. It already handles completed/resumed attempts. |
| Submit objective answers | Matching `finish-*`/`submit-*` handler | Reuse the exact subject endpoint and existing answer-map shape. |
| Attempt/date picker | Existing `*-attempts` or `*-dates` endpoint | Reuse for history UI in the same subject; IDs differ (`exam_id`, `attempt_id`, `exam_attempt_id`, `session_id`). |
| Report/review | Existing subject report and review pair | Reuse rather than recalculating in the browser. Reports and reviews are distinct contracts. |
| Writing | Shared homework/result/history/submit endpoints plus program-specific start/current endpoint | Reuse shared endpoints only where current components already do; program-specific current paths must remain distinct. |
| AI explanation | TS/general objective, Selective Reading, or NAPLAN Reading explanation endpoint | Reuse with the matching body shape. Do not send reading payloads to the TS endpoint without confirming support. |
| Question lookup/reset | Existing topic/count/bank/search/reset endpoints in `QuizSetup*.js` | Reuse within the same question-bank family and filters. Similar names are not proof of interchangeable schemas. |
| Generate exams | Existing random/latest and active/homework endpoint quartet for that subject | Reuse existing `GenerateExam*.js` handler and payload. |
| Student/class reports | `StudentReportShell_backend` report/filter endpoints | Reuse existing report data instead of creating duplicate summary endpoints. |
| Readiness/email | Existing overall report and email endpoints | Reuse for Selective/OC readiness and PDF delivery only. |
| Center/class/student CRUD | Existing admin endpoints/components | Reuse to preserve center scoping and current field names. |

## 7. Backend Implementation Structure

No backend source is contained in this project. There are no route/controller/service/model/schema/database/middleware files and no server package. The API appears to be an external HTTP service, but its framework and database cannot be confirmed from this frontend.

What can be confirmed:

- The browser calls the API directly using `fetch` and a small amount of Axios.
- Identity/tenant values are passed as `student_id`, `center_code`, class fields, and attempt IDs.
- The API performs attempt persistence/resume, question selection, scoring, report aggregation, uploads, and administration because the frontend consumes the resulting states.
- Backend authorization rules, database tables/collections, transactions, and validation schemas are **unknown**. Comments naming tables are not sufficient to treat a schema as confirmed.

## 8. API Base URL / Environment Configuration

| Variable/config | Purpose | Behavior |
|---|---|---|
| `REACT_APP_API_URL` | Primary external API origin | Read directly by most components. Many throw/log when absent. CRA embeds it at build time. |
| `REACT_APP_IMAGE_BASE_URL` | NAPLAN image base | Used in `NaplanNumeracy` and `NaplanLanguageConventions`; no default is consistently defined in source. |
| `REACT_APP_API_BASE` | Used only by orphaned `WritingReviewScreen.js` | Inconsistent with the active `REACT_APP_API_URL`; not part of the main route flow. |
| `firebase.json` | Firebase Hosting | Serves `build/`; rewrites all routes to `/index.html`. No Firebase SDK/data configuration. |

Exceptions: Foundational components hard-code `https://web-production-481a5.up.railway.app`; some inactive doctor/chatbot/upload artifacts hard-code other Railway hosts. `ExamCleaner` falls back to `http://localhost:8000`; several OC components fall back to `http://localhost:3000`. There is no shared fetch/Axios configuration and no source-visible development/production URL switch beyond environment values and these fallbacks.

## 9. Data Model

These are frontend-observed entities, not confirmed database models.

| Entity | Important observed fields / relationships | CRUD/storage evidence |
|---|---|---|
| Session user | `user_type,center_code,name,student_id,class_name,session_token` | Created by login response; selected fields stored in `sessionStorage`; backend persistence unknown. |
| Center | `center_code,center_name,phone_number,email,address,status,time_zone` | Center CRUD endpoints. Admins/teachers/classes/students reference `center_code`. |
| Center admin/teacher | `id,center_code,full_name,username,password,email,phone_number` | Dedicated CRUD endpoint families. Password is submitted but not read back into edit forms. |
| Student | `id,student_id,name,gender,student_year,class_name,class_day,parent_email,center_code` | Student CRUD/bulk endpoints. Assigned to center/class/year. |
| Class/class year | IDs/names plus `center_code`; class-year filters use class name | Dedicated CRUD and report lookup APIs. |
| Quiz configuration | Subject/program, class year, difficulty, topic counts, question counts, center, active/homework mode | Created by `QuizSetup*.js`; exact persisted schema varies by subject and is backend-defined. |
| Question | IDs (`q_id`, `question_id`, or `id`), `question`/`question_text`, `question_blocks`/`blocks`, `options`/`choices`/`answer_options`, `correct_answer`, `topic`, passage/section references | Uploaded and queried from external backend; images point to Google Cloud Storage. |
| Reading exam | `exam_json.sections[]`; section has `question_type`, reading material/passage style, questions, sometimes shared answer options | Content endpoints; flattened into local question arrays. |
| Writing exam | `writing_type,question_text` plus parsed prompt sections | Current/content endpoints; response wrapped as `exam`. |
| Attempt/session | IDs vary by family: `exam_id`, `attempt_id`, `exam_attempt_id`, `session_id`; timestamps such as `completed_at`/`date`; completion and remaining-time fields | Start/resume creates or returns it; finish persists answers; attempts/dates retrieve it. |
| Answer set | Objective `{questionId: optionKey}`; writing `{answer_text,writing_type}` | Local during attempt, then submitted in one request. |
| Report | Overall score/count/accuracy/result, topic breakdown, components, improvement order, and sufficient-data flags depending on subject | Backend-calculated and read-only in frontend. |
| Review question | Question content/options plus `student_answer,correct_answer,is_correct` | Review endpoints by exam/attempt/session. |

There are no Firestore collections, documents, subcollections, Firebase Auth calls, or Firebase Storage SDK calls in the source. The image URL prefix `https://storage.googleapis.com/exammoduleimages/` is direct public HTTP access, not Firebase client access.

## 10. Exam Workflow

### Creation and generation

Admin -> `AdminPage` create tab -> program/subject -> matching `QuizSetup*` -> dependent GETs -> controlled configuration form -> active/homework config POST -> response/alert/reset. Super Admin sees destructive question-bank controls; Center Admin can create/generate according to tab filtering.

Admin -> generate tab -> program/subject -> random/latest -> matching `GenerateExam*` -> date/batch/class-year lookups -> generation POST -> backend selects questions/creates exam -> `generatedExam` and message rendered.

There is no separate frontend publishing state. The implementation treats generated active/homework exams and availability responses as the effective assignment/publishing mechanism. Do not invent draft/publish endpoints.

### Student attempt

Dashboard mode -> availability -> subject -> welcome/instructions -> start POST. If `completed`, load report. Otherwise store questions/attempt/time -> answer/navigation state -> finish manually or at zero -> submit answer map -> backend scores/persists -> report -> optional attempt selection/review.

Reading adds a content GET and flattens sections. Writing starts a program-specific session, loads `current`, edits rich text, submits text, then loads result/history. Foundational advances through sections using `next-section` before final report.

## 11. Component / Feature Map

| Feature | Route -> page/main component -> state -> API/data |
|---|---|
| Login | `/` -> `LoginPage` -> username/password/error -> `/login-exam-module`. |
| Selective student | `/SelectiveDashboard` -> subject component -> dashboard phase/mode + component attempt state -> Selective endpoint family. |
| OC student | `/OCDashboard` -> OC subject component -> same pattern -> OC endpoint family. |
| NAPLAN student | `/NAPLAN` -> NAPLAN subject component -> same pattern -> NAPLAN endpoint family. |
| Foundational | `/selectiveFoundational` -> `Foundational_dashboard` -> `ExamPageFoundational` -> hard-coded Foundational API. |
| Writing review deep link | `/writing-review/:attemptId` -> `WritingReview` -> history/review APIs. |
| Admin users | `/adminpanel` -> database tab -> user subcomponent -> student/class APIs. |
| Centers | `/adminpanel` -> `CenterManagement` -> center/admin/teacher CRUD children -> CRUD APIs. |
| Question setup | `/adminpanel` -> add-quiz -> `QuizSetup*` -> local form/topic/bank state -> config/question APIs. |
| Generation | `/adminpanel` -> generate-exam -> `GenerateExam*` -> mode/date/batch state -> generation APIs. |
| Reports | `/adminpanel` -> `StudentExamReports` or `StudentReportShell_backend` -> filters -> report APIs. |
| Readiness | `/adminpanel` -> Selective/OC readiness -> report state/print ref -> overall/email APIs. |
| Leaderboard | `/adminpanel` -> `Leaderboard` -> cascading filters -> leaderboard APIs. |

## 12. Routing Map

| Route | Component | Access / parameters | Navigation |
|---|---|---|---|
| `/` | `LoginPage` | Public | Dispatches after login. |
| `/selectiveFoundational` | `Foundational_dashboard` | `PrivateRoute`; no role check at route level | Login fallback class. |
| `/writing-review/:attemptId` | `WritingReview` | `PrivateRoute`; `attemptId` path param | Returns to Selective dashboard via navigation state. |
| `/SelectiveDashboard` | `FullWidthLayout(SelectiveDashboard)` | `PrivateRoute` | Student class `Selective`. |
| `/OCDashboard` | `FullWidthLayout(OCDashboard)` | `PrivateRoute` | Student class `OC`. |
| `/NAPLAN` | `NaplanDashboard` | `PrivateRoute` | Student class `NAPLAN`. |
| `/adminpanel` | `AdminPanel` | `PrivateRoute`; role passed from `sessionStorage` | Admin/teacher roles. Path matching is case-insensitive in normal React Router usage, while navigation uses `/AdminPanel`. |

`PrivateRoute` checks only `App`'s in-memory `isLoggedIn`. It does not restore login from storage and does not check roles. A refresh resets `isLoggedIn` to false. Admin authorization in the UI is tab filtering, not route-level enforcement.

## 13. State Management Map

- `App`: `isLoggedIn`, `doctorData`, `sessionToken`; common identity in `sessionStorage`.
- Dashboards: `activeSubject`, `examInProgress`, `examPhase`, `examMode`, availability; Selective also has `reportVariant`.
- Objective exam components: local `mode`, questions/current index, answers, visited, flags, time, report, attempts/dates, selected attempt, explanation/loading, confirm modal; refs prevent duplicate start/finish.
- Reading: additionally exam sections/passages/active extract and normalized report.
- Writing: exam/active/completed, rich text, selected history/result, submission and finish-confirmation state.
- Admin: active tab, user submode, create/generate category/type/step/mode; children own their forms and responses.
- Reports: filter state, option lists, report/loading/error, and explicit `shouldGenerate` trigger.

API calls update local state directly. There is no cache, query library, reducer, context, or cross-page synchronization.

## 14. Forms and Validation

Patterns to follow:

- Controlled form object or individual `useState` values.
- `handleChange` copies `[name]: value`.
- Validate required selections before setting loading.
- Guard duplicate submissions with `isSubmitting`/`submitting`.
- JSON forms set `Content-Type`; file forms use `FormData`.
- Parse `response.json()` and use `detail`/`message` when available.
- On success, alert and reset/refetch; on failure, alert or set inline error; always clear loading in `finally`.
- Quiz forms perform subject-specific count/range validation; generation latest mode requires date and batch.

There is no reusable form framework or uniform error shape. Preserve the exact field names expected by each endpoint.

## 15. Authentication and Authorization

Authentication is a login POST with cookie credentials. Successful identity is split between React state and `sessionStorage`. Role dispatch is based on `user_type`; student program dispatch is based on `class_name`.

Authorization visible in this frontend:

- `PrivateRoute` only checks boolean login state.
- `AdminPanel` filters tabs by `SUPER_ADMIN`, `CENTER_ADMIN`, or `CENTER_TEACHER`.
- Some `QuizSetup` controls additionally branch on `userType` (for example, destructive bank actions for Super Admin and generation/config controls for non-Super Admin).
- Center-scoped calls pass `center_code` explicitly.
- No frontend Authorization header is used and the returned `session_token` is not consumed after login.

Actual backend permission enforcement cannot be confirmed. Future work must not treat hidden UI as sufficient authorization.

## 16. Important Business Logic

- Students are routed to NAPLAN, Selective, OC, or Foundational from the login response class name.
- Subject availability is backend-driven; dashboards prevent switching while `examInProgress` is true.
- Historical report mode skips welcome/instructions.
- Active attempts warn on browser unload/back navigation; first-question back attempts open finish confirmation in several components.
- Timers pause while confirmation modals are open in several objective components, but expiration still calls finish; implementation details vary by subject.
- Objective answers are normalized to uppercase option keys in TS/MR families.
- Flags and visited markers affect only UI summaries.
- `completed: true` from start/current routes sends the student to reports instead of creating another attempt.
- Writing blocks copy/cut/paste/context menu while active and submits `answer_text` with `writing_type`.
- NAPLAN Language Conventions defines `TYPE_2_MAX_SELECTIONS = 2` for multi-selection question behavior.
- Readiness normalizes objective components to 100 and writing from a maximum of 25; scores at or above 90 are classified as strengths in the frontend presentation.
- Generated latest exams require selected upload date/batch; active and homework generation use separate endpoints.
- Role tab sets are exactly those listed in Section 2/`AdminPage.js`; Center Teacher has reporting/leaderboard but no configuration tabs.

## 17. Existing Implementation Patterns

- Keep program/subject variants in separate components and select endpoints conditionally for active versus homework.
- Use dashboard phase state rather than adding routes for every exam screen.
- Read `student_id`, `user_type`, and `center_code` from the established props/session keys.
- Normalize multiple backend question shapes at component boundaries (`blocks`, `question_blocks`, options aliases).
- Prefix relative image names with the existing Google Storage/image-base URL.
- Use start/resume -> current/content -> finish -> report -> review ordering.
- Use refs for one-time start and duplicate-submit protection.
- Keep admin dependency selects loaded with guarded effects.
- Reuse the exact existing endpoint family and payload before adding a new one.

## 18. Important Dependencies

| Dependency | Actual use | Reuse guidance |
|---|---|---|
| React 19 / React DOM | Entire component/state/effect architecture | Continue current functional-component style. |
| `react-router-dom` | Router, protected routes, navigation, params/location | Reuse for any new route/query-driven variant. |
| Axios | A few class-year and legacy doctor CRUD forms | Most active code uses `fetch`; follow the neighboring component. |
| TipTap packages | Writing rich-text editor and text formatting | Reuse for writing-editor features. |
| `recharts` | Readiness/report visualizations | Reuse for compatible report charts. |
| `react-to-print` / `html2pdf.js` | Printable readiness reports and PDF email attachments | Reuse existing print-root pattern. |
| `@dnd-kit/*` | Ordering/drag interactions in question UI | Reuse where existing ordering components are extended. |
| `lucide-react` | Icons in applicable UI | Reuse rather than adding another icon library. |
| `react-timezone-select` | Center timezone input | Reuse in center configuration. |
| Tailwind/PostCSS | Utility styling in newer admin components | Coexists with CSS/inline styles; follow local file style. |
| CRA/testing-library | Build/test harness | `npm start`, `npm run build`, `npm test`. Test coverage is minimal. |

## 19. Environment / Configuration

- `package.json`: CRA scripts and browser targets.
- `firebase.json`: deploys `build`, SPA rewrite to `index.html`.
- `tailwind.config.js`: scans all source JS/JSX/TS/TSX.
- `postcss.config.js`: Tailwind and Autoprefixer.
- `public/manifest.json`: PWA metadata; `public/index.html`: mount shell.
- Environment names: `REACT_APP_API_URL`, `REACT_APP_IMAGE_BASE_URL`, and the inconsistent orphan-only `REACT_APP_API_BASE`. Do not record values or secrets in documentation/source.

## 20. Current Limitations / Known Issues

Confirmed from the implementation:

- No backend source, API schema, or automated contract client is present.
- API calls and base URL logic are duplicated across many components.
- Hard-coded Railway origins bypass `REACT_APP_API_URL` in Foundational and legacy artifacts.
- Route protection is lost on refresh and does not enforce roles.
- The login token is stored but not used; only login explicitly includes cookies.
- Similar subjects use inconsistent IDs, endpoint naming, response wrappers, and mode names.
- Loading/error handling and timer/history behavior are duplicated and not fully uniform.
- Extensive debug logging and stale comments remain.
- Several imported names in `App.js` and `AdminPage.js` are unused; mock, legacy doctor/chatbot, `temp.js`, `.txt`, duplicate upload, and placeholder endpoint files exist but are not on the active render graph.
- `REACT_APP_IMAGE_BASE_URL` and localhost fallbacks are inconsistent.
- There is no explicit publishing screen/status; generation plus backend availability is the implemented lifecycle.
- Tests are limited to the CRA starter-level `App.test.js`; subject workflows and API contracts lack focused automated tests.

## 21. Future Feature Implementation Guide

1. Start at the owning route in `App.js`; for student behavior continue to the dashboard and subject component, for admin behavior continue to the rendered tab child in `AdminPage.js`.
2. Identify the local state machine and whether the change concerns `exam`, `homework`, `report`, or `review`.
3. Identify the exact ID type used by that family (`exam_id`, `attempt_id`, `exam_attempt_id`, or `session_id`).
4. Inspect the component-local async handler and its request/response fields; there is no separate service file.
5. Check Sections 4-6 and the neighboring active/homework variant for an existing endpoint.
6. Reuse the existing endpoint and normalization logic when the required capability is already supported.
7. If backend changes are genuinely required, inspect the external backend repository separately; this repository cannot establish its services/models.
8. Preserve current center/role/session parameters and do not bypass backend authorization.
9. Make the smallest change in the owning component and matching variant(s).
10. Test login/refresh, availability, start/resume, navigation/timer, submit, report/history/review, errors, and the relevant role/program.

## 22. Endpoint Quick Reference

This compact table lists the endpoint families most likely to be reused. Section 4 is the detailed inventory.

| Method | Endpoint | Purpose | Frontend owner | Reusable for |
|---|---|---|---|---|
| POST | `/login-exam-module` | Login/role dispatch | `App.js` | Existing Exam Module login only. |
| GET | `/api/student/{oc-}available-subjects`, `/api/student/available-subjects-naplan` | Availability | dashboards | Existing program/mode selection. |
| POST | Subject `start-*` / `finish-*` pairs | Attempt lifecycle | subject exam components | Same program/subject/mode. |
| GET | Subject `*-attempts` / `*-dates` | History IDs/dates | exam/report components | Existing history selectors. |
| GET | Subject `*-report` / `*-review` | Score summary and question review | exam + review components | Existing reports/reviews. |
| POST | `/api/ai/explain-question-TS` | Objective explanation | TS/MR/NAPLAN | Existing compatible objective payloads. |
| POST | `/api/ai/explain-question-selective-reading` | Reading explanation | Reading components | Selective/OC reading payload. |
| GET | `/api/topics*`, `/api/question-count`, question-bank/search endpoints | Configure question selection | `QuizSetup*.js` | Matching bank family. |
| POST | `/api/quizzes*` and reading config endpoints | Save active/homework configs | `QuizSetup*.js` | Matching subject config. |
| GET | Date/batch lookup endpoints | Latest generation inputs | `GenerateExam*.js` | Matching subject. |
| POST | `/api/exams/generate-*`, `/naplan/*/generate-*` | Generate exams/homework | `GenerateExam*.js` | Matching program/subject/mode. |
| GET/POST/PUT/DELETE | center/class/student endpoint families | Administration | admin CRUD children | Existing tenant/user management. |
| GET | `/api/reports/*` | Student/class/cumulative reports | `StudentReportShell_backend` | Existing reporting filters. |
| POST | readiness overall/email endpoints | Readiness PDF/email | readiness components | Existing Selective/OC reports. |
| POST | `/exam/clean-word-document` | Clean Word document | `ExamCleaner` | Same multipart cleaning operation. |

## 23. File Quick Reference

| File | Responsibility | Important exports/functions | API dependency | Used by |
|---|---|---|---|---|
| `src/App.js` | Auth/routes/layout | `App`, `LoginPage`, `PrivateRoute` | Login | Entry point |
| `src/components/AdminPage.js` | Role tabs/feature composition | `AdminPanel` | Child-owned | `/adminpanel` |
| `src/components/SelectiveDashboard.js` | Selective orchestration | default dashboard | Availability | App |
| `src/components/OCDashboard.js` | OC orchestration | default dashboard | Availability | App |
| `src/components/NaplanDashboard.js` | NAPLAN orchestration | default dashboard | Availability | App |
| `src/components/ExamPageThinkingSkills.js` | Selective TS lifecycle | component handlers | TS family | Selective dashboard |
| `src/components/ExamPageMathematicalReasoning.js` | Selective MR lifecycle | component handlers | MR family | Selective dashboard |
| `src/components/ReadingComponent.js` | Selective Reading lifecycle | component handlers/normalizers | Reading family | Selective dashboard |
| `src/components/ExamPageWriting.js` | Selective Writing lifecycle | start/load/finish/history | Writing family | Selective dashboard |
| `src/components/ExamPageOcThinkingSkills.js` | OC TS lifecycle | handlers | OC TS family | OC dashboard |
| `src/components/ExamPageOCMathematicalReasoning.js` | OC MR lifecycle | handlers | OC MR family | OC dashboard |
| `src/components/ReadingComponentOC.js` | OC Reading lifecycle | endpoint constants/handlers | OC Reading family | OC dashboard |
| `src/components/ExamPageOCwriting.js` | OC Writing lifecycle | handlers | OC/current + shared writing | OC dashboard |
| `src/components/Naplan*.js` | NAPLAN lifecycles | subject components | NAPLAN families | NAPLAN dashboard |
| `src/components/QuizSetup*.js` | Config/question-bank management | local handlers | Setup/admin APIs | Admin panel |
| `src/components/GenerateExam*.js` | Exam generation | local lookup/generate handlers | Generation APIs | Admin panel |
| `src/components/StudentReportShell_backend.js` | Report filters/data loading | default component | Report APIs | Admin panel |
| `src/components/SelectiveReadinessOverall.js`, `OCReadinessOverall.js` | Readiness/report PDF/email | default components | Readiness/email APIs | Admin panel |
| `src/hooks/useVariant.js` | Resolve URL/prop variant | default `useVariant` | None | Writing flow |

## 24. Architectural Rules / Do Not Break

- Treat the external backend as the source of truth for attempts, availability, scoring, reports, and question-bank state.
- Preserve exact endpoint paths, parameter names, and the subject-specific ID type.
- Reuse existing active/homework/report/review endpoint families before adding equivalents.
- Preserve center scoping and role checks; UI filtering does not replace backend authorization.
- Do not replace `exam_json.sections` or question block/option normalization without accounting for existing records and all program variants.
- Keep duplicate-start and duplicate-submit guards when modifying attempt effects.
- Keep timeout submission and completed/resume handling intact.
- Do not assume Firebase stores application data; it is hosting-only here.
- Do not derive or duplicate backend scoring in new frontend code when a report endpoint already provides it.
- Verify whether a similarly named file is active from `App.js`/`AdminPage.js` before editing it.

## 25. Current Project State

The current frontend is a React 19/CRA single-page application with six protected feature routes and a public login. It supports complete student attempt/report/review flows across Selective, OC, NAPLAN, and Foundational variants, plus broad center-admin tooling for data management, question ingestion/configuration, generation, reporting, readiness, leaderboard, and document cleaning.

The architecture is component-local: dashboards select modes and subjects; large subject components own state and direct API calls; admin tabs mount specialized setup/generation/report children. The backend is an external API configured primarily by `REACT_APP_API_URL`; its implementation and database are not in this workspace. Important shared data concepts are centers, users/students/classes, quiz configs/question banks, generated exams, attempts, answer maps, reports, and reviews.

The safest extension path is to follow the active route -> dashboard/tab -> owning component, reuse that component's endpoint family and request/response shape, preserve ID/center/auth context, and validate the entire affected lifecycle. New backend functionality should be considered only after the detailed endpoint inventory confirms that no existing capability supports the requirement.
