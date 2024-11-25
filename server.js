const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');  // GPT APIにリクエストを送るため
const app = express();
const port = 3000;

// ボディパーサーの設定（JSONの解析用）
app.use(bodyParser.json());
app.use(express.static('public'));  // public フォルダの静的ファイルを提供

// GPT API設定
const GPT_API_KEY = process.env.GPT_API_KEY;

const GPT_API_URL = 'https://api.openai.com/v1/chat/completions';



    // POSTリクエストで解答を受け取るエンドポイント
    app.post('/submit-answer', async (req, res) => {
        const userAnswer = req.body.answer;  // クライアントからの解答を取得

        const prompt = `あなたは教師です。以下のルールで正答判定をしてください：
1. ユーザーの解答において、正しい式「1 + 3n」への言及があれば、それが適切に説明されているかを判断してください。
2. ユーザーの解答が異なる表現であっても、正しい考え方に基づいていれば「正解です！」と伝え、誤りがあれば不足している部分や誤りを指摘してください。
3. 必要に応じて、ユーザーに簡単なヒントを与えて解答を改善させてください。

正答の例：
- 正方形が1つ増えるごとにマッチ棒は3本ずつ増えていくから、式は「1 + 3n」になる。
- 青色で囲んでいる一本が最初にあり、そのあとはコの字型の繰り返しになる。コの字型は3本のマッチ棒からなっているので、式は「1 + 3n」になる。
- 最初の青で囲んだ部分に1本、次に3本の組み合わせが正方形の数だけあるので、式は「1 + 3n」になる。

以下の解答に基づいて評価を行ってください：
ユーザーの解答：${userAnswer}
ユーザーの解答における「3n + 1」などの言及に対して適切な評価を行ってください。`;

try {
    const gptResponse = await fetch(GPT_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ GPT_API_KEY } `,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                { role: 'system', content: 'あなたは教師です。' },
                { role: 'user', content: prompt }
            ],
        }),
    });

    const data = await gptResponse.json();

    console.log('GPT API Response:', data); // ここでレスポンスを確認
    if (!data.choices || data.choices.length === 0) {
        throw new Error('GPT APIレスポンスにchoicesが含まれていません');
    }
    
    const gptMessage = data.choices[0].message.content;
    if (data && data.choices && data.choices.length > 0) {
        const gptMessage = data.choices[0].message.content;
        res.json({ result: gptMessage });  // GPTの返答をクライアントに返す
    } else {
        res.status(500).json({ error: 'GPTからの無効な応答' });
    }
} catch (error) {
    console.error('GPT APIへのリクエストに失敗:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました。' });
}
});



// サーバーを起動
app.listen(port, () => {
    console.log(`サーバーが http://localhost:${port} で起動しました`);
});
