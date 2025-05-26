export default async function handler(req, res) {
  const GPT4_KEYS = [
    process.env.GPT4O_1,
    process.env.GPT4O_2,
    process.env.GPT4O_3,
    process.env.GPT4O_4,
  ].filter(Boolean);

  const GPT35_KEYS = [
    process.env.GPT35_1,
    process.env.GPT35_2,
    process.env.GPT35_3,
    process.env.GPT35_4,
  ].filter(Boolean);

  const chatHistory = req.body.messages;
  const payload = {
    messages: chatHistory,
  };

  async function tryKeys(keys, model) {
    for (let key of keys) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`,
        },
        body: JSON.stringify({ ...payload, model }),
      });

      if (response.status === 200) {
        const data = await response.json();
        return res.status(200).json(data);
      }

      const errorData = await response.json();
      if (!errorData.error?.message?.includes("rate limit")) {
        return res.status(500).json(errorData);
      }
    }

    return null;
  }

  let result = await tryKeys(GPT4_KEYS, "gpt-4o");
  if (!result) {
    await tryKeys(GPT35_KEYS, "gpt-3.5-turbo");
  }
}
