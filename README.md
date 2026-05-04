# 🚀 Success OS — מדריך הרצה ודיפלוי

## מה זה?
אפליקציית React + TypeScript למעקב יומי אחרי הרגלים, מטרות וציון הצלחה — עם AI Coach מ-NVIDIA NIM.

---

## שלב 1 — התקנת Node.js

### Windows / Mac
1. היכנס לאתר: **https://nodejs.org**
2. הורד את הגרסה **LTS** (הצד השמאלי)
3. התקן — לחץ Next בכל המסכים
4. בדוק שעבד: פתח Terminal ורשום:
```bash
node -v
npm -v
```
אמור להופיע מספר גרסה כמו `v20.x.x`

---

## שלב 2 — הרצה מקומית

### פתח Terminal בתיקיית הפרויקט:

```bash
# כנס לתיקייה
cd success-os

# התקן תלויות (פעם אחת בלבד)
npm install

# הרץ את האפליקציה
npm run dev
```

פתח דפדפן בכתובת: **http://localhost:5173**

---

## שלב 3 — דיפלוי ל-GitHub Pages (חינמי!)

### 3.1 — צור חשבון GitHub
אם אין לך: **https://github.com/signup**

### 3.2 — צור repository חדש
1. לך ל: **https://github.com/new**
2. שם: `success-os`
3. Public ✅
4. לחץ **Create repository**

### 3.3 — העלה את הקוד

פתח Terminal בתיקיית הפרויקט:

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/success-os.git
git push -u origin main
```

> החלף `YOUR_USERNAME` בשם המשתמש שלך ב-GitHub

### 3.4 — הפעל GitHub Pages

1. לך ל-repository שלך ב-GitHub
2. לחץ על **Settings** (למעלה)
3. בצד שמאל: **Pages**
4. תחת **Source** — בחר: **GitHub Actions**
5. שמור

### 3.5 — המתן לדיפלוי

- לך ל-tab: **Actions** ב-repository
- תראה workflow רץ (עיגול צהוב = מתבצע, ירוק = הצליח)
- לוקח בערך 2-3 דקות

### 3.6 — קבל את הלינק!

אחרי שה-workflow ירוק:
1. חזור ל-**Settings → Pages**
2. תראה: `Your site is live at https://YOUR_USERNAME.github.io/success-os/`
3. פתח את הלינק בטלפון 📱
4. שמור למסך הבית (Safari → Share → Add to Home Screen)

---

## שלב 4 — הגדרת API Key

1. לך ל: **https://build.nvidia.com**
2. צור חשבון חינמי
3. לחץ על **Get API Key**
4. העתק את ה-key (מתחיל ב-`nvapi-`)
5. באפליקציה: לך ל-**הגדרות** → הדבק את ה-key

---

## עדכון הקוד (אחרי שינויים)

```bash
git add .
git commit -m "update"
git push
```

GitHub Actions יעשה דיפלוי אוטומטי תוך דקות!

---

## מבנה הפרויקט

```
success-os/
├── src/
│   ├── components/
│   │   ├── AICoach.tsx       # ממשק AI Coach עם NVIDIA NIM
│   │   ├── ChecklistCard.tsx # צ'קליסט יומי
│   │   ├── HistoryTab.tsx    # היסטוריה + סטטיסטיקות
│   │   ├── ScoreCard.tsx     # ציון + streak
│   │   └── SettingsTab.tsx   # הגדרות + API Key
│   ├── hooks/
│   │   ├── useAI.ts          # לוגיקת NVIDIA NIM API
│   │   └── useLocalStorage.ts # שמירת נתונים
│   ├── types/index.ts        # TypeScript types
│   ├── constants.ts          # ציטוטים + רשימת משימות
│   ├── App.tsx               # קומפוננטה ראשית
│   └── main.tsx              # נקודת כניסה
├── .github/workflows/
│   └── deploy.yml            # GitHub Actions דיפלוי
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

---

## טכנולוגיות

| טכנולוגיה | גרסה | שימוש |
|-----------|------|-------|
| React | 19 | UI |
| TypeScript | 5.7 | Type safety |
| Vite | 6 | Build tool |
| Tailwind CSS | 3.4 | Styling |
| Lucide React | 0.469 | אייקונים |
| NVIDIA NIM | - | AI Coach |

---

## בעיות נפוצות

**`npm install` נכשל?**
```bash
npm install --legacy-peer-deps
```

**הדיפלוי לא עובד?**
- תוודא שה-repository הוא **Public**
- תוודא שבחרת **GitHub Actions** ב-Pages settings

**ה-AI לא עונה?**
- בדוק שה-API Key מתחיל ב-`nvapi-`
- תוודא שיש לך קרדיט ב-NVIDIA NIM
