const $mainEl = $("main");
const $modalEl = $("#authentication-modal");
const $addBtn = $("[data-modal-target]");
const $formEl = $("#scheduleForm");

let start = moment().subtract(29, "days");
let end = moment();

function fetchData(start, end) {
    console.log("fetch data 날짜", start, end);
    const scheduleData = JSON.parse(localStorage.getItem("schedule"));
    const dataArr = {};
    if (!scheduleData) return;

    for (const date in scheduleData["dates"]) {
        // start와 end 범위에 있는 데이터만 넣기
        if (moment(date).isBefore(start) || moment(date).isAfter(end)) {
            continue;
        }
        dataArr[date] = [...scheduleData["dates"][date]];
    }

    for (const selectDate in dataArr) {
        const sectionEl = document.createElement("section");
        const olEl = document.createElement("ol");
        sectionEl.classList.add("w-7/12", "m-auto");
        olEl.classList.add(
            "relative",
            "border-l",
            "border-gray-200",
            "dark:border-gray-700"
        );

        sectionEl.insertAdjacentHTML(
            "beforeend",
            `<h2 class="text-2xl mb-4 font-extrabold dark:text-white">${selectDate}</h2>`
        );

        dataArr[selectDate].forEach((data, i) => {
            const liElement = document.createElement("li");
            liElement.insertAdjacentHTML(
                "beforeend",
                `<span
            class="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
            <svg class="w-2.5 h-2.5 text-blue-800 dark:text-blue-300" aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path
                    d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
            </svg>
            </span>
            <h3 class="title flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                ${data.title}
            </h3>
            <time class="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">${data.time}</time>
            <p class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">${data.content}</p>`
            );

            if (i === 0) {
                liElement.querySelector(".title").insertAdjacentHTML(
                    "beforeend",
                    `<span
            class="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 ml-3">Latest</span>`
                );
            }

            liElement.classList.add("pl-8");

            olEl.append(liElement);
        });

        sectionEl.append(olEl);
        $mainEl.append(sectionEl);
    }
}

function openModal() {
    $modalEl.css("display", "flex");
    $modalEl.after(
        `<div class="modal-backdrop bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40"></div>`
    );
}

function closeModal(e) {
    if (
        e.target.closest('[data-modal-hide="authentication-modal"]') ||
        e.target.id === "authentication-modal"
    ) {
        $modalEl.hide();
        $(".modal-backdrop").remove();
    }
}

function addSchdule(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const dateInfo = formData.get("time");
    const addData = {};
    const wholeData = JSON.parse(localStorage.getItem("schedule"));

    for (const [key, value] of formData) {
        addData[key] = value;
    }

    if (wholeData) {
        if (!wholeData["dates"]) {
            wholeData["dates"] = {};
        }
        if (!wholeData["dates"][dateInfo]) {
            wholeData["dates"][dateInfo] = [];
        }
        console.log("확인", wholeData["dates"]);
        wholeData["dates"][dateInfo].push(addData);
        localStorage.setItem("schedule", JSON.stringify(wholeData));
    } else {
        const wholeData = { dates: {} };
        wholeData["dates"][dateInfo] = [addData];
        localStorage.setItem("schedule", JSON.stringify(wholeData));
    }

    // 로컬 스토리지에 저장 후 닫기
    $modalEl.hide();
    $(".modal-backdrop").remove();
}

// 스케줄 범위 설정 완료시 이벤트
$("#reportrange").on("apply.daterangepicker", function (ev, picker) {
    console.log("확인", start, end);
});

// 스케줄 추가하기 버튼 클릭시 이벤트
$addBtn.on("click", () => openModal());

// 모달 외부 영역 및 닫기 클릭
$modalEl.on("click", (e) => closeModal(e));

// 스케줄 추가하기
$formEl.on("submit", (e) => addSchdule(e));

$(function () {
    function cb(start, end) {
        $("#reportrange span").html(
            start.format("YYYY. MM. DD") + " - " + end.format("YYYY. MM. DD")
        );
    }

    $("#reportrange").daterangepicker(
        {
            startDate: start,
            endDate: end,
            ranges: {
                Today: [moment(), moment()],
                Yesterday: [
                    moment().subtract(1, "days"),
                    moment().subtract(1, "days"),
                ],
                "Last 7 Days": [moment().subtract(6, "days"), moment()],
                "Last 30 Days": [moment().subtract(29, "days"), moment()],
                "This Month": [
                    moment().startOf("month"),
                    moment().endOf("month"),
                ],
                "Last Month": [
                    moment().subtract(1, "month").startOf("month"),
                    moment().subtract(1, "month").endOf("month"),
                ],
            },
            locale: {
                daysOfWeek: moment.locale("ko").daysOfWeek,
                monthNames: moment.locale("ko").monthNames,
                applyLabel: "적용",
                cancelLabel: "취소",
            },
            timePicker: true,
        },
        cb
    );

    cb(start, end);
    fetchData(start, end);
});
