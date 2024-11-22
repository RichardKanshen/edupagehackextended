document.querySelectorAll('.edu-hack').forEach((answer) => {
    if (answer.classList.contains("border")) {
        answer.style.border = "";
        answer.classList.remove("edu-hack", "border");
    }
    else {
        answer.remove();
    }
});

let originalContents = {}, keepIndex = 0, showing = false;

const warnSecured = (question) => {
    if (question.props.isSecured == true) {
        question.element.before("<div class='edu-hack' style='background-color: red;'>This question is secured, the answers might not be correct!</div>");
    }
};

const noAnswer = (question) => {
    let answers;

    switch (question.getWidgetClass()) {
        case "ConnectAnswerETestWidget": answers = question.props.pairs; break;
        case "GroupsAnswerETestWidget": answers = question.props.groups; break;
        case "OrderingAnswerETestWidget": answers = question.props.answers; break;
        case "MapAnswerETestWidget": answers = question.props.points; break;
        case "SvgAnswerETestWidget": answers = question.props.correctExpression; break;
        default: answers = question.props.correctAnswers; break;
    }

    try {
        if (answers.length === 0) {
            question.element.before("<div class='edu-hack' style='background-color: red; color: white; padding: 5px;'>I can't find the answer to this question...</div>");
            return true;
        }
    } catch (e) {
        console.log(question, e)
    }
};

function parseCorrectExpression(correctExpression) {
    const expressions = correctExpression.split(/&&|\|\|/);
    const correctAnswers = {};

    expressions.forEach((expression) => {
        const parts = expression.split(/[()]/).filter(Boolean);
        parts.forEach((part) => {
            const match = part.match(/g_(\w+) == "(\w+)"/);
            if (match) {
                const [, variable, value] = match;
                if (correctAnswers[variable]) {
                    correctAnswers[variable].push(value);
                } else {
                    correctAnswers[variable] = [value];
                }
            }
        });
    });

    const output = Object.entries(correctAnswers).map(([variable, values]) => {
        return `${variable} = ${values.filter((value, index, array) => array.indexOf(value) === index).join(" / ")}`;
    });

    return output;
}

const getCircularReplacer = () => { const seen = new WeakSet(); return (key, value) => { if (typeof value === "object" && value !== null) { if (seen.has(value)) { return; } seen.add(value); } return value; }; };

function showCorrectAnswers() {
    materialObj.getAllAnswerWidgets().forEach((question) => {
        if (question.getWidgetClass() == "AbcdAnswerETestWidget") {
            const answers = question.props.correctAnswers;
            const id = question.id;

            if (answers == undefined) {
                return;
            }

            warnSecured(question);

            for (let i = 0; i < answers.length; i++) {
                const targetElements = document.querySelector(`[data-wid="${id}"]`)?.querySelectorAll(`[data-answerid="${answers[i]}"]`);

                if (targetElements == undefined) {
                    continue;
                }

                for (let k = 0; k < targetElements.length; k++) {
                    targetElements[k].style.border = "2px solid #2196F3";
                    targetElements[k].classList.add("edu-hack", "border");
                }
            }
        }
        else if (question.getWidgetClass() == "InputAnswerETestWidget") {
            const answers = question.props.correctAnswers;

            noAnswer(question);
            warnSecured(question);

            question.element.before(`<br class='edu-hack'><br class='edu-hack'><span class='edu-hack' style='border: 2px solid #2196F3; background: white; color: black; padding: 5px; margin: 5px;'>Answer: "` + answers.join(`" OR "`) + `" </span><br class='edu-hack'><br class='edu-hack'>`);
        }
        else if (question.getWidgetClass() == "OrderingAnswerETestWidget") {
            const answers = question.props.answers;

            noAnswer(question);
            warnSecured(question);

            let output = "<div class='edu-hack' style='background-color: #2196F3; color: white; padding: 5px; margin: 0;'>Correct order:<ol style='list-style-type: decimal; padding-left: 30px;'>";

            for (let i = 0; i < answers.length; i++) {
                const answerText = answers[i].text;
                output += `<li> ${answerText} </li>`;
            }

            output += "</div>";

            question.element.before(output);
        }
        else if (question.getWidgetClass() == "GroupsAnswerETestWidget") {
            const groups = question.props.groups;

            warnSecured(question);

            let output = "<div class='edu-hack' style='background-color: #2196F3; color: white; padding: 5px; margin: 0;'>Correct grouping:<div>"
            for (let i = 0; i < groups.length; i++) {
                const group = groups[i].items;

                output += `<div> ${groups[i].title} </div><ol style='list-style-type: decimal; padding-left: 30px;'>`

                for (let j = 0; j < group.length; j++) {
                    output += `<li> ${group[j].text} </li>`;
                }
                output += "</ol>"
            }
            output += "</div>";

            question.element.before(output);
        }
        else if (question.getWidgetClass() == "ConnectAnswerETestWidget") {
            const correctAnswers = question.props.pairs;

            warnSecured(question);

            let output = "<div class='edu-hack' style='background-color: #2196F3; color: white; padding: 5px; margin: 0;'>Correct answers:<ol style='list-style-type: decimal; padding-left: 30px;'>"

            for (answerid = 0; answerid < correctAnswers.length; answerid++) {
                output += `<li> ${correctAnswers[answerid].l}`;
                output += `${correctAnswers[answerid].r} </li>`;
            }
            output += "</ol></div>"

            question.element.before(output);
            question.element[0].style = "border: 2px solid #2196F3;";
            question.element[0].classList.add("edu-hack", "border");
        }
        else if (question.getWidgetClass() == "MapAnswerETestWidget") {
            const points = question.props.points;

            warnSecured(question);

            for (let i = 0; i < points.length; i++) {
                const currentPoint = points[i];

                const answer = document.querySelectorAll(`[data-id="${currentPoint.pointid}"]`)[0];
                const point = document.querySelectorAll(`[data-id="${currentPoint.r_pointid}"]`)[0];

                answer.addEventListener("mouseenter", () => {
                    point.style.backgroundColor = "green";
                });

                answer.addEventListener("mouseleave", () => {
                    point.style.backgroundColor = "";
                });
            }
        } else if (question.getWidgetClass() == "SvgAnswerETestWidget") {

            const answers = question.props.answers;
            const correctExpression = question.props.correctExpression;

            // Parse the correct expression to determine the correct answers
            const correctAnswers = parseCorrectExpression(correctExpression);

            Object.keys(question.answersExtended).forEach((key, index) => {
                const draggableSelector = `#wq${question.id}---${key}`;
                const droppableSelector = `#wq${question.id}---${key}`;

                const draggableElem = document.querySelector(draggableSelector);
                const droppableElem = document.querySelector(droppableSelector);

                if (draggableElem) {
                    const tspan = draggableElem.querySelector('tspan');
                    if (tspan) {
                        originalContents[keepIndex] = tspan.outerHTML;
                        tspan.setAttribute("data-keep-index", keepIndex);
                        keepIndex++;
                        tspan.textContent = String(key.replace("g_", ""));
                    } else {
                        originalContents[keepIndex] = draggableElem.outerHTML;
                        draggableElem.setAttribute("data-keep-index", keepIndex);
                        keepIndex++;
                        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                        tspan.textContent = String(key.replace("g_", ""));
                        tspan.style = "font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:35.2778px;font-family:Arial;-inkscape-font-specification:Arial;fill:#000000;stroke:#000000;stroke-width:0;stroke-opacity:0"
                        tspan.setAttribute("x", Number(draggableElem.querySelector("circle").getAttribute("cx")) - Number(draggableElem.querySelector("circle").getAttribute("r") / 8 * 3))
                        tspan.setAttribute("y", Number(draggableElem.querySelector("circle").getAttribute("cy")) + Number(draggableElem.querySelector("circle").getAttribute("r") / 2))
                        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
                        text.style = "font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:35.2778px;line-height:1.25;font-family:Arial;-inkscape-font-specification:Arial;opacity:0.87;fill:#ff9955;fill-opacity:1;stroke:#000000;stroke-width:0;stroke-linecap:round;stroke-opacity:0;paint-order:fill markers stroke;stop-color:#000000"
                        text.appendChild(tspan)
                        draggableElem.appendChild(text);
                    }
                }

                if (droppableElem) {
                    const tspan = droppableElem.querySelector('tspan');
                    if (tspan) {
                        originalContents[keepIndex] = tspan.outerHTML;
                        tspan.setAttribute("data-keep-index", keepIndex);
                        keepIndex++;
                        tspan.textContent = String(key.replace("g_", ""));
                    } else {
                        originalContents[keepIndex] = droppableElem.outerHTML;
                        droppableElem.setAttribute("data-keep-index", keepIndex);
                        keepIndex++;
                        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                        tspan.textContent = String(key.replace("g_", ""));
                        tspan.style = "font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:35.2778px;font-family:Arial;-inkscape-font-specification:Arial;fill:#000000;stroke:#000000;stroke-width:0;stroke-opacity:0"
                        tspan.setAttribute("x", droppableElem.querySelector("circle").getAttribute("cx") - droppableElem.querySelector("circle").getAttribute("r") / 2)
                        tspan.setAttribute("y", droppableElem.querySelector("circle").getAttribute("cy") - droppableElem.querySelector("circle").getAttribute("r") / 2)
                        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
                        text.style = "font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:35.2778px;line-height:1.25;font-family:Arial;-inkscape-font-specification:Arial;opacity:0.87;fill:#ff9955;fill-opacity:1;stroke:#000000;stroke-width:0;stroke-linecap:round;stroke-opacity:0;paint-order:fill markers stroke;stop-color:#000000"
                        text.appendChild(tspan)
                        droppableElem.appendChild(text);
                    }
                }
            });

            // Display the correct answers
            let output = "<div class='edu-hack' style='background-color: #2196F3; color: white; padding: 5px; margin: 0;'>Correct answers:<ol style='list-style-type: decimal; padding-left: 30px;'>";

            for (let i = 0; i < correctAnswers.length; i++) {
                output += `<li> ${correctAnswers[i]} </li>`;
            }

            output += "</div>";

            question.element.before(output);
        }else if (question.getWidgetClass() == "SvgAnswerETestWidget") {
        console.log(question)
        function parseCorrectExpression(correctExpression) {
            const expressions = correctExpression.split(/&&|\|\|/);
            const correctAnswers = {};
          
            expressions.forEach((expression) => {
              const parts = expression.split(/[()]/).filter(Boolean);
              parts.forEach((part) => {
                const match = part.match(/g_(\w+) == "(\w+)"/);
                if (match) {
                  const [, variable, value] = match;
                  if (correctAnswers[variable]) {
                    correctAnswers[variable].push(value);
                  } else {
                    correctAnswers[variable] = [value];
                  }
                }
              });
            });
          
            const output = Object.entries(correctAnswers).map(([variable, values]) => {
              return `${variable} = ${values.filter((value, index, array) => array.indexOf(value) === index).join(" / ")}`;
            });
          
            return output;
        }
        
        const answers = question.props.answers;
        const correctExpression = question.props.correctExpression;
      
        // Parse the correct expression to determine the correct answers
        const correctAnswers = parseCorrectExpression(correctExpression);

        console.log(correctAnswers)

        Object.keys(question.answersExtended).forEach((key, index) => {
            const draggableSelector = `#wq${question.id}---${key}`;
            const droppableSelector = `#wq${question.id}---${key}`;
        
            const draggableElem = document.querySelector(draggableSelector);
          const droppableElem = document.querySelector(droppableSelector);
          
          console.log(key)
        
            if (draggableElem) {
              const tspan = draggableElem.querySelector('tspan');
              if (tspan) {
                console.log(key)
                tspan.textContent = String(key.replace("g_", ""));
              } else {
                console.log(key)
                const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                tspan.textContent = String(key.replace("g_", ""));
                tspan.style = "font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:35.2778px;font-family:Arial;-inkscape-font-specification:Arial;fill:#000000;stroke:#000000;stroke-width:0;stroke-opacity:0"
                tspan.setAttribute("x", Number(draggableElem.querySelector("circle").getAttribute("cx")) - Number(draggableElem.querySelector("circle").getAttribute("r") / 8 * 3))
                tspan.setAttribute("y", Number(draggableElem.querySelector("circle").getAttribute("cy")) + Number(draggableElem.querySelector("circle").getAttribute("r") / 2))
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
                text.style = "font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:35.2778px;line-height:1.25;font-family:Arial;-inkscape-font-specification:Arial;opacity:0.87;fill:#ff9955;fill-opacity:1;stroke:#000000;stroke-width:0;stroke-linecap:round;stroke-opacity:0;paint-order:fill markers stroke;stop-color:#000000"
                text.appendChild(tspan)
                draggableElem.appendChild(text);
              }
            }
        
            if (droppableElem) {
              const tspan = droppableElem.querySelector('tspan');
              if (tspan) {
                console.log(key)
                tspan.textContent = String(key.replace("g_", ""));
              } else {
                console.log(key)
                const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                tspan.textContent = String(key.replace("g_", ""));
                tspan.style = "font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:35.2778px;font-family:Arial;-inkscape-font-specification:Arial;fill:#000000;stroke:#000000;stroke-width:0;stroke-opacity:0"
                tspan.setAttribute("x", droppableElem.querySelector("circle").getAttribute("cx") - droppableElem.querySelector("circle").getAttribute("r") / 2)
                tspan.setAttribute("y", droppableElem.querySelector("circle").getAttribute("cy") - droppableElem.querySelector("circle").getAttribute("r") / 2)
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
                text.style = "font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:35.2778px;line-height:1.25;font-family:Arial;-inkscape-font-specification:Arial;opacity:0.87;fill:#ff9955;fill-opacity:1;stroke:#000000;stroke-width:0;stroke-linecap:round;stroke-opacity:0;paint-order:fill markers stroke;stop-color:#000000"
                text.appendChild(tspan)
                droppableElem.appendChild(text);
              }
            }
          });
      
        // Display the correct answers
        let output = "<div class='edu-hack' style='background-color: #2196F3; color: white; padding: 5px; margin: 0;'>Correct answers:<ol style='list-style-type: decimal; padding-left: 30px;'>";
      
        for (let i = 0; i < correctAnswers.length; i++) {
          output += `<li> ${correctAnswers[i]} </li>`;
        }
      
        output += "</div>";

        console.log(answers, correctExpression, correctAnswers, output);
      
        question.element.before(output);
      }
    });
}

function hideCorrectAnswers() {
    document.querySelectorAll(".edu-hack:not(.border)").forEach(e => e.remove())
    document.querySelectorAll(".edu-hack.border").forEach(e => { e.style.border = ""; e.classList.remove("edu-hack", "border") })
    document.querySelectorAll("[data-keep-index]").forEach(e => e.outerHTML = originalContents[e.getAttribute("data-keep-index")])
}

function chooseCorrectAnswers() {
    if (materialObj.isSecured) { alert("THIS TEST IS SECURED\nThis means, that the correct answers are not being sent to the client, and therefore, this extension can't choose, or show the correct answers.\nYou're on your own, buddy :3\n\n\nsucks to suck") }
    materialObj.getAllAnswerWidgets().forEach(function (question, index) {
        try {
            if (noAnswer(question)) {
                if (question.getWidgetClass() === "AbcdAnswerETestWidget") {
                    if (question.element[0].querySelector("[data-val='x']"))
                        question.setAnswered("x")
                } else
                    alert(`No correct answer detected for question Number ${materialObj.getAllAnswerWidgets().indexOf(question) + 1}`);
            } else {
                if (question.getWidgetClass() === "AbcdAnswerETestWidget") {
                    let correctAnswers = question.props.correctAnswers
                    question.setAnswered(correctAnswers)
                } else if (question.getWidgetClass() === "InputAnswerETestWidget") {
                    let correctAnswers = question.props.correctAnswers
                    question.setAnswered(correctAnswers[Math.round(Math.random() * (correctAnswers.length - 1))])
                } else if (question.getWidgetClass() === "ConnectAnswerETestWidget") {
                    let correctAnswers = question.props.pairs;
                    let solvedQuestion = {}
                    correctAnswers.forEach(a => {
                        solvedQuestion[a.itemid] = { itemid: a.r_itemid, connected: true }
                    })
                    question.setAnswered(solvedQuestion)
                } else if (question.getWidgetClass() === "GroupsAnswerETestWidget") {
                    let correctAnswers = question.props.groups;
                    let solvedQuestion = []
                    correctAnswers.forEach((arr, i) => {
                        arr.items.forEach(a => {
                            solvedQuestion.push({ itemid: a.itemid, groupid: i, isMoved: true })
                        })
                    });
                    question.setAnswered(solvedQuestion)
                } else if (question.getWidgetClass() === "OrderingAnswerETestWidget") {
                    question.setAnswered(question.props.answers.map(a => a.answerid))
                } else if (question.getWidgetClass() === "MapAnswerETestWidget") {
                    let correctAnswers = {}
                    question.props.points.forEach(p => {
                        correctAnswers[p.pointid] = p.r_pointid
                    })
                    question.setAnswered(correctAnswers)
                } else if (question.getWidgetClass() === "SvgAnswerETestWidget") {
                    let correctAnswers = question.props.correctExpression;
                    correctAnswers = correctAnswers.split("||").map(a => a.trim())
                    console.log(correctAnswers)
                    let chosenAnswer = correctAnswers[Math.round(Math.random() * (correctAnswers.length - 1))]
                    let parsedAnswer = parseCorrectExpression(chosenAnswer)
                    let answerObject = {}
                    parsedAnswer.forEach((answer) => {
                        let [variable, value] = answer.split(" = ")
                        answerObject["g_" + variable] = [{ eid: `g_${value}` }]
                    })
                    console.log(answerObject)
                    question.setAnswered(answerObject)
                } else {
                    alert(`Question of type ${question.getWidgetClass()} has not been encountered and implemented yet! But you can fix that!\n\nyou can go to \nhttps://github.com/RichardKanshen/edupagehackextended/issues/\nand report this!\nIn the next pop-up box, you will be given a JSON object representation of the question.\nScreenshot it/take an image of it (make sure the code is readable!)/copy it from the console (CTRL+Shift+J / Cmd+Option+J), and put that into the description of the new issue. Ready?`)
                    alert(JSON.stringify({ ...question, parent: null, mainWidget: null, _pageWidgetForMain: null, _questionWidget: null, alist: null, element: null, type: question.getWidgetClass(), oattachements: null }, getCircularReplacer()))
                    console.log(JSON.stringify({ ...materialObj.getAllAnswerWidgets()[0], parent: null, mainWidget: null, _pageWidgetForMain: null, _questionWidget: null, alist: null, element: null, type: materialObj.getAllAnswerWidgets()[0].getWidgetClass(), oattachements: null }, getCircularReplacer()))
                    for (let saved = false; saved === false; saved = saved) {
                        alert(JSON.stringify({ ...materialObj.getAllAnswerWidgets()[0], parent: null, mainWidget: null, _pageWidgetForMain: null, _questionWidget: null, alist: null, element: null, type: materialObj.getAllAnswerWidgets()[0].getWidgetClass(), oattachements: null }, getCircularReplacer()))
                        saved = confirm("Did you copy it? Or take a screenshot? Or both??? If you did, press 'OK'. If you did not, press cancel, and I will show you on more time.")
                    }
                }
            }
        } catch (e) {
            console.error(e, question);
        }
    });
}

document.addEventListener("keydown", (event) => {
    if (event.key === "h") {
        if (showing === false) return;
        hideCorrectAnswers()
        showing = false;
    } else if (event.key === "s") {
        if (showing === true) return;
        showCorrectAnswers();
        showing = true;
    } else if (event.key === "c") {
        if (showing === false) return;
        chooseCorrectAnswers();
    }
})
