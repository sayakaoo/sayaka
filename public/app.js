// public/app.js

document.addEventListener('DOMContentLoaded', () => {
    const startVoiceButton = document.getElementById('startVoice');
    const stopVoiceButton = document.getElementById('stopVoice');
    const feedbackElement = document.getElementById('feedback');
    const submitButton = document.getElementById('submitAnswer');

    let recognition;
    let userAnswer = '';  // 音声で認識された解答

    // 音声認識の設定（Web Speech API）
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.lang = 'ja-JP';
        recognition.continuous = false;  // 一度だけ認識
        recognition.interimResults = false;  // 確定した結果だけを受け取る
        recognition.maxAlternatives = 1;  // 一番最初の候補を使用

        recognition.onstart = () => {
            feedbackElement.textContent = '音声入力中...';
        };

        recognition.onerror = (event) => {
            feedbackElement.textContent = '音声認識エラーが発生しました';
        };

        recognition.onend = () => {
            feedbackElement.textContent = '音声入力終了';
        };

        recognition.onresult = (event) => {
            userAnswer = event.results[0][0].transcript; // 認識された結果を取得
            feedbackElement.textContent = `音声認識結果: ${userAnswer}`;
        };
    } else {
        feedbackElement.textContent = '音声認識はサポートされていません';
    }

    // 音声入力開始ボタンがクリックされたとき
    startVoiceButton.addEventListener('click', () => {
        if (recognition) {
            recognition.start();
            startVoiceButton.disabled = true;
            stopVoiceButton.disabled = false;
        }
    });

    // 音声入力終了ボタンがクリックされたとき
    stopVoiceButton.addEventListener('click', () => {
        if (recognition) {
            recognition.stop();
            startVoiceButton.disabled = false;
            stopVoiceButton.disabled = true;
        }
    });

    // 解答送信ボタンがクリックされたとき
    submitButton.addEventListener('click', async () => {
        if (!userAnswer) {
            feedbackElement.textContent = '解答を入力または音声で入力してください';
            return;
        }

        try {
            console.log('リクエスト送信中:', userAnswer);

            const response = await fetch('/submit-answer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ answer: userAnswer }),
            });

            console.log('レスポンス:', response);

            const result = await response.json();
            console.log('結果:', result);

            if (result.error) {
                feedbackElement.textContent = `エラー: ${result.error}`;
            } else {
                feedbackElement.textContent = `評価結果: ${result.result}`;
            }
        } catch (error) {
            console.error('フェッチエラー:', error);
            feedbackElement.textContent = 'サーバーエラーが発生しました。';
        }
    })})