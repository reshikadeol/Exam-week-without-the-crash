// STUDY PLANNER

let tasks = JSON.parse(
    localStorage.getItem("studyTasks") || "[]"
);

function saveTasks() {
    localStorage.setItem(
        "studyTasks",
        JSON.stringify(tasks)
    );
}

function addTask() {
    let subject = document.getElementById("subject").value.trim();
    let topic = document.getElementById("topic").value.trim();
    let time = document.getElementById("studyTime").value;

    if (!subject || !topic || !time) {
        alert("Please fill all the details!");
        return;
    }

    tasks.push({
        subject,
        topic,
        time,
        completed: false
    });

    saveTasks();
    displayTasks();

    document.getElementById("subject").value = "";
    document.getElementById("topic").value = "";
    document.getElementById("studyTime").value = "";
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    displayTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    displayTasks();
}

function displayTasks() {
    let list = document.getElementById("taskList");
    let progress = document.getElementById("progress");
    let percentText = document.getElementById("progressPercent");
    let progressFill = document.getElementById("progressFill");

    if (!list) return;

    list.innerHTML = "";

    tasks.forEach((task, index) => {
        let item = document.createElement("div");
        item.className = "task";

        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.onchange = () => toggleTask(index);

        let details = document.createElement("span");
        details.textContent =
            task.subject + " - " + task.topic +
            " (" + task.time + ")";

        if (task.completed) {
            details.classList.add("done");
        }

        let remove = document.createElement("button");
        remove.textContent = "Delete";
        remove.onclick = () => deleteTask(index);

        item.append(checkbox, details, remove);
        list.appendChild(item);
    });

    // Calculate study progress
    let completed = tasks.filter(t => t.completed).length;
    let total = tasks.length;

    let percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    // Update progress text
    if (progress) {
        progress.textContent =
            "Completed: " + completed + " / " + total;
    }

    // Update percentage
    if (percentText) {
        percentText.textContent = percentage + "%";
    }

    // Update progress bar width
    if (progressFill) {
        progressFill.style.width = percentage + "%";
    }
}

// FOCUS TIMER

let seconds = 25 * 60;
let timerInterval = null;

function updateTimer() {
    let timer = document.getElementById("timer");
    if (!timer) return;

    let minutes = Math.floor(seconds / 60);
    let remaining = seconds % 60;

    timer.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(remaining).padStart(2, "0");
}

function startTimer() {
    if (timerInterval !== null) return;

    let message = document.getElementById("timerMessage");
    if (message) message.textContent = "Stay focused! 📚";

    timerInterval = setInterval(() => {
        seconds--;
        updateTimer();

        if (seconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;

            let message = document.getElementById("timerMessage");
            if (message) {
                message.textContent = "Great work! Time for a break ☕";
            }

            alert("Focus session completed! Take a short break.");
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetTimer() {
    pauseTimer();
    seconds = 25 * 60;
    updateTimer();

    let message = document.getElementById("timerMessage");
    if (message) message.textContent = "Ready to focus?";
}

updateTimer();


// MOOD CHECK-IN

function setMood(mood) {
    let result = document.getElementById("moodResult");

    if (result) {
        result.textContent = "Your mood: " + mood;
    }
}
// DAILY WELLNESS REMINDER SYSTEM

let reminderSettings =
    JSON.parse(localStorage.getItem("wellnessSettings") || "null");

let reminderChecker = null;

function saveWellnessSettings() {
    reminderSettings = {
        water: Number(document.getElementById("waterInterval").value),
        breakTime: Number(document.getElementById("breakInterval").value),
        breakfast: document.getElementById("breakfastTime").value,
        lunch: document.getElementById("lunchTime").value,
        dinner: document.getElementById("dinnerTime").value,
        sleep: document.getElementById("sleepTime").value
    };

    localStorage.setItem(
        "wellnessSettings",
        JSON.stringify(reminderSettings)
    );
}

function showReminder(message) {
    if ("Notification" in window &&
        Notification.permission === "granted") {

        new Notification("Exam Week Without Crash 🌸", {
            body: message
        });
    }
}

async function enableReminders() {

    if (!("Notification" in window)) {
        alert("Notifications are not supported in this browser.");
        return;
    }

    let permission = await Notification.requestPermission();

    if (permission !== "granted") {
        document.getElementById("reminderStatus").textContent =
            "Please allow browser notifications to use reminders.";
        return;
    }

    saveWellnessSettings();

    localStorage.setItem("remindersEnabled", "true");

    let now = Date.now();

    localStorage.setItem("lastWater", now);
    localStorage.setItem("lastBreak", now);

    startReminderChecker();

    document.getElementById("reminderStatus").textContent =
        "Your daily reminders are ON! 🔔";
}

function disableReminders() {

    localStorage.setItem("remindersEnabled", "false");

    clearInterval(reminderChecker);
    reminderChecker = null;

    document.getElementById("reminderStatus").textContent =
        "Your reminders are turned OFF.";
}

function checkDailyReminder(type, time, message) {

    if (!time) return;

    let now = new Date();

    let currentTime =
        String(now.getHours()).padStart(2, "0") + ":" +
        String(now.getMinutes()).padStart(2, "0");

    let today = now.toISOString().slice(0, 10);

    let key = "last_" + type + "_" + today;

    if (currentTime === time &&
        localStorage.getItem(key) !== "done") {

        showReminder(message);
        localStorage.setItem(key, "done");
    }
}

function checkIntervalReminder(type, interval, message) {

    let key = "last" + type;

    let last = Number(localStorage.getItem(key) || Date.now());

    let elapsed = Date.now() - last;

    if (elapsed >= interval * 60 * 1000) {

        showReminder(message);

        localStorage.setItem(key, Date.now());
    }
}

function checkAllReminders() {

    if (localStorage.getItem("remindersEnabled") !== "true") {
        return;
    }

    if (!reminderSettings) return;

    checkIntervalReminder(
        "Water",
        reminderSettings.water,
        "Time to drink some water! 💧"
    );

    checkIntervalReminder(
        "Break",
        reminderSettings.breakTime,
        "You have been studying. Take a short break! ☕"
    );

    checkDailyReminder(
        "Breakfast",
        reminderSettings.breakfast,
        "Remember to have your breakfast! 🍎"
    );

    checkDailyReminder(
        "Lunch",
        reminderSettings.lunch,
        "It is lunchtime! Take a meal break. 🍱"
    );

    checkDailyReminder(
        "Dinner",
        reminderSettings.dinner,
        "Remember to have your dinner! 🍽️"
    );

    checkDailyReminder(
        "Sleep",
        reminderSettings.sleep,
        "It is your planned bedtime. Get ready to rest! 🌙"
    );
}

function startReminderChecker() {

    clearInterval(reminderChecker);

    checkAllReminders();

    reminderChecker = setInterval(
        checkAllReminders,
        15000
    );
}


// RESTORE SAVED SETTINGS

function loadWellnessSettings() {

    if (!reminderSettings) return;

    document.getElementById("waterInterval").value =
        reminderSettings.water;

    document.getElementById("breakInterval").value =
        reminderSettings.breakTime;

    document.getElementById("breakfastTime").value =
        reminderSettings.breakfast;

    document.getElementById("lunchTime").value =
        reminderSettings.lunch;

    document.getElementById("dinnerTime").value =
        reminderSettings.dinner;

    document.getElementById("sleepTime").value =
        reminderSettings.sleep;
}

if (document.getElementById("waterInterval")) {

    loadWellnessSettings();

    if (localStorage.getItem("remindersEnabled") === "true") {

        document.getElementById("reminderStatus").textContent =
            "Your daily reminders are ON! 🔔";

        if ("Notification" in window &&
            Notification.permission === "granted") {
            startReminderChecker();
        } else {
            document.getElementById("reminderStatus").textContent =
                "Allow notifications again to receive reminders.";
        }
    }
}
