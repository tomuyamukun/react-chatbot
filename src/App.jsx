import React, { useState, useEffect, useCallback } from "react";
import "./assets/styles/style.css";
import { Answers, Chats } from "./components/index";
import FormDialog from "./components/Forms/FormDialog";
import { db } from "./firebase/index";

const App = () => {
	const [answers, setAnswers] = useState([]);
	const [chats, setChats] = useState([]);
	const [currentId, setCurrentId] = useState("init");
	const [dataset, setDataset] = useState([]);
	const [open, setOpen] = useState(false);

	const displayNextQuestion = (nextQuestionId, nextDataset) => {
		addChats({
			text: nextDataset.question,
			type: "question",
		});

		setAnswers(nextDataset.answers);
		setCurrentId(nextQuestionId);
	};

	const selectAnswer = (selectedAnswer, nextQuestionId) => {
		switch (true) {
			// お問い合わせを選択したらお問い合わせフォーム表示
			case nextQuestionId === "contact":
				handleClickOpen();
				break;

			// testメソッドを使用https:からはじまるか
			case /^https:*/.test(nextQuestionId, dataset[nextQuestionId]):
				const a = document.createElement("a");
				a.href = nextQuestionId;
				// 別タブでaタグのページを開く
				a.target = "_blank";
				a.click();
				break;

			default:
				addChats({
					text: selectedAnswer,
					type: "answer",
				});

				// setTimeout(())で遅延表示()の中はコールバック関数
				setTimeout(
					() => displayNextQuestion(nextQuestionId, dataset[nextQuestionId]),
					1000
				);
				break;
		}
	};

	const addChats = (chat) => {
		setChats((prevChats) => {
			return [...prevChats, chat];
		});
	};

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = useCallback(() => {
		setOpen(false);
	}, [setOpen]);

	useEffect(() => {
		(async () => {
			const initDataset = {};
			await db
				.collection("questions")
				.get()
				.then((snapshots) => {
					snapshots.forEach((doc) => {
						const id = doc.id;
						const data = doc.data();
						initDataset[id] = data;
					});
				});
			setDataset(initDataset);
			displayNextQuestion(currentId, initDataset[currentId]);
		})();
	}, []);

	// 最新のチャットが見えるようにスクロール位置の頂点をスクロール領域の最下部に設定
	useEffect(() => {
		const scrollArea = document.getElementById("scroll-area");
		// if文elseなし
		if (scrollArea) {
			scrollArea.scrollTo({
				top: scrollArea.scrollHeight,
				behavior: "smooth",
			});
		}
	});

	return (
		<div>
			<section className="c-section">
				<div className="c-box">
					<Chats chats={chats} />
					<Answers answers={answers} select={selectAnswer} />
					<FormDialog open={open} handleClose={handleClose} />
				</div>
			</section>
		</div>
	);
};
export default App;
