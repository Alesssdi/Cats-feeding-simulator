
document.getElementById("params-form").addEventListener("submit", function (event) {
    event.preventDefault();

    let resetButton;
    let startButton;
    let gameInProgress = false; 

    resetButton = document.createElement("button");
    resetButton.textContent = "Начать заново";
    document.getElementById('params-form').appendChild(resetButton);
    resetButton.classList.add("reset_btn");
    resetButton.addEventListener("click", resetGame);

    startButton = document.querySelector(".start-btn");
    startButton.parentNode.removeChild(startButton);

    const n = parseInt(document.getElementById("n").value);
    const b = parseInt(document.getElementById("b").value);
    const m = parseInt(document.getElementById("m").value);
    const t = parseInt(document.getElementById("t").value);
    const r = parseInt(document.getElementById("r").value);

    if (isNaN(n) || isNaN(b) || isNaN(m) || isNaN(t) || isNaN(r) || n < 1 || b < 1 || m < 1 || t < 1 || r < 1) {
        alert("Пожалуйста, введите корректные значения.");
        return;
    }

    let totalTime = 0;
    let totalWaitTime = 0;
    let catsFed = 0;
    let queue = [];
    let bowlAmount = m;

    async function feedCat() {
        if (!gameInProgress || queue.length === 0) return; 

        if (bowlAmount == 0) {
            await refillBowl();
        }

        const catIndex = queue.shift();
        const spd = b / t;
        totalTime += t;

        const eatTime = Math.min(bowlAmount, b) / spd;
        const remains = b - Math.min(bowlAmount, b);

        totalWaitTime = t - eatTime;
        if (!gameInProgress) return resolve();

        document.getElementById("output").innerText += `Котик ${catIndex + 1} подошел к миске.\n`;

        await new Promise(resolve => {
            setTimeout(async () => {

                if (!gameInProgress) return resolve();

                if (totalWaitTime > 0) {
                    document.getElementById("output").innerText += `Котик ${catIndex + 1} ждет пока наполнят миску.\n`;
                    await refillBowl();
                    document.getElementById("output").innerText += `Котик ${catIndex + 1} продолжил есть.\n`;
                    bowlAmount -= remains;

                    await new Promise(innerResolve => {
                        setTimeout(() => {
                            if (!gameInProgress) return resolve();
                            document.getElementById("output").innerText += `Котик ${catIndex + 1} отошел от миски.\n`;
                            catsFed++;
                            innerResolve();
                        }, totalWaitTime * 1000);
                    });
                } else {
                    bowlAmount -= b;
                    document.getElementById("output").innerText += `Котик ${catIndex + 1} отошел от миски.\n`;
                    catsFed++;
                }

                if (catsFed === n) {
                    document.getElementById("output").innerText += `Все котики накормлены! Затраченное время: ${totalTime} сек.\n`;
                } else {
                    await feedCat();
                }
                resolve();
            }, eatTime * 1000);
        });
    }

    function refillBowl() {
        document.getElementById("output").innerText += "Бабушка наполняет миску.\n";
        bowlAmount = m;
        totalTime += r;
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!gameInProgress) return resolve();
                document.getElementById("output").innerText += "Миска наполнена.\n";
                resolve();
            }, r * 1000);
        });
    }

    for (let i = 0; i < n; i++) {
        queue.push(i);
    }

    gameInProgress = true; 
    feedCat();

    function resetGame() {
        totalTime = 0;
        totalWaitTime = 0;
        catsFed = 0;
        queue = [];
        bowlAmount = m;
        document.getElementById("output").innerText = "";
        document.getElementById("params-form").reset();
        resetButton.parentNode.removeChild(resetButton);

        startButton = document.createElement("button");
        startButton.textContent = "Запустить";
        document.getElementById('params-form').appendChild(startButton);
        startButton.classList.add("start-btn");
        
        gameInProgress = false; 
    }
});
