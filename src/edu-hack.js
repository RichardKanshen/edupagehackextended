document.querySelectorAll('.edu-hack').forEach((answer) => {
    if (answer.classList.contains("border")) {
        answer.style.border = "";
        answer.classList.remove("edu-hack", "border");
    }
    else {
        answer.remove();
    }
});

materialObj.getAllAnswerWidgets().forEach((question) => {
    const warnSecured = (question) => {
        if (question.props.isSecured == true) {
            question.element.before("<div class='edu-hack' style='background-color: red;'>This question is secured, the answers might not be correct!</div>");
        }
    };

    const noAnswer = (question) => {
        const answers = question.props.correctAnswers;

        if (answers.length == 0) {
            question.element.before("<div class='edu-hack' style='background-color: red; color: white; padding: 5px;'>I can't find the answer to this question...</div>");
            return;
        }
    };

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
    else if (question.getWidgetClass() == "InputAnswerETestWidget") { // old code
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
