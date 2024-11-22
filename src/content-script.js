const showAnswers = () => {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("src/edu-hack.js");

    (document.head || documentElement).appendChild(script);
    const title = document.querySelector('title').textContent;
    console.log(title)
    document.querySelector('title').textContent = "EduHack Enabled";
    setTimeout(() => document.querySelector('title').textContent = title, 1000);
};

showAnswers();