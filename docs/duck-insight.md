# Duck Insight setup

Duck Insight calls LangChain's `ChatOpenAI` integration only after a signed-in user selects **Duck insight** on an incorrect, completed assessment. It uses `gpt-4o-mini` by default.

Add the following to the server-side `.env` file and restart Next.js:

```dotenv
OPENAI_API_KEY=your_openai_api_key
# Optional model override:
DUCK_INSIGHT_MODEL=gpt-4o-mini
```

The candidate's submitted code and the problem's public examples/reference solution are sent to the configured OpenAI model for this request. The app does not write the generated analysis to the database. The submitted code is already part of the assessment submission record; Duck Insight does not create or modify any database records. The browser passes the code through one-time `sessionStorage`, removes it when the insight page opens, and sends it to the authenticated API route.
