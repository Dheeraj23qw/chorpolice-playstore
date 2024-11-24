import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { playSound, stopQuizSound, stopTimerSound } from "@/redux/reducers/soundReducer";
import { RootState } from "@/redux/store";
import { useGameTableAndScores } from "@/hooks/questionhook/quizhook";

const NUM_QUESTIONS = 7;
const CORRECT_ANSWER_GIF = 7;
const INCORRECT_ANSWER_GIF = 6;
const TIMER_UP_GIF = 8;

export const useQuizGameLogic = () => {
  const { getRandomQuestion } = useGameTableAndScores();
  const dispatch = useDispatch();
  const difficulty = useSelector((state: RootState) => state.difficulty.level);

  const [countdown, setCountdown] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [question, setQuestion] = useState(getRandomQuestion());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isDynamicPopUp, setIsDynamicPopUp] = useState(false);
  const [mediaId, setMediaId] = useState<number>(1);
  const [mediaType, setMediaType] = useState<"image" | "video" | "gif">("image");
  const [showHint, setShowHint] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [wrongAnswer, setWrongAnswer] = useState(0);
  const [notanswer, setNotAnswer] = useState(0);
  const [isOverlayRemoved, setIsOverlayRemoved] = useState(false);
  const [remainingOptions, setRemainingOptions] = useState<string[] | null>(null);
  const [isFiftyFiftyActive, setIsFiftyFiftyActive] = useState(false);
  const [isFiftyFiftyUsed, setIsFiftyFiftyUsed] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetGame = () => {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setQuestion(getRandomQuestion());
    setCountdown(0);
    setIsDynamicPopUp(false);
    setMediaId(1);
    setMediaType("image");
    setShowHint(false);
    setCorrectAnswer(0);
    setWrongAnswer(0);
    setNotAnswer(0);
    setIsOverlayRemoved(false);
    setRemainingOptions(null);
    setIsFiftyFiftyActive(false);
    setIsFiftyFiftyUsed(false);
    dispatch(stopTimerSound());
    dispatch(playSound("quiz"));
  };

  const handleFiftyFifty = () => {
    if (isFiftyFiftyUsed) {
      return; // Handle already used lifeline
    }

    if (!question || !question.options) return;

    if (question.options.length === 4) {
      const incorrectOptions = question.options.filter(
        (option) => option !== question.correctAnswer
      );
      const randomIncorrectOption = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
      setRemainingOptions([question.correctAnswer, randomIncorrectOption]);
      setIsFiftyFiftyActive(true);
      setIsFiftyFiftyUsed(true);
    }
  };

  const handleAnswerSelection = (answer: string) => {
    dispatch(stopTimerSound());
    setSelectedAnswer(answer);
    setIsDynamicPopUp(true);

    if (timerRef.current) clearInterval(timerRef.current);

    if (answer === question?.correctAnswer) {
      setCorrectAnswer((prev) => prev + 1);
      setMediaType("gif");
      setMediaId(CORRECT_ANSWER_GIF);
      setIsCorrect(true);
      dispatch(playSound("win"));
    } else {
      setWrongAnswer((prev) => prev + 1);
      setIsCorrect(false);
      setMediaType("gif");
      setMediaId(INCORRECT_ANSWER_GIF);
      dispatch(playSound("lose"));
    }

    setTimeout(() => {
      setIsDynamicPopUp(false);
      setShowHint(true);
    }, 3000);
  };

  const handleNextQuestion = () => {
    if (questionIndex + 1 === NUM_QUESTIONS) {
      resetGame();
    } else {
      setSelectedAnswer(null);
      setIsCorrect(null);
      setQuestion(getRandomQuestion());
      setQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  useEffect(() => {
    let initialTime = 0;
    switch (difficulty) {
      case "easy":
        initialTime = 20;
        break;
      case "medium":
        initialTime = 30;
        break;
      case "hard":
        initialTime = 50;
        break;
    }
    setCountdown(initialTime);

    timerRef.current = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown > 0) return prevCountdown - 1;
        dispatch(stopTimerSound());
        clearInterval(timerRef.current!);
        setIsDynamicPopUp(true);
        setMediaType("gif");
        setMediaId(TIMER_UP_GIF);
        setNotAnswer((prev) => prev + 1);
        setTimeout(() => {
          setIsDynamicPopUp(false);
          setShowHint(true);
        }, 4000);

        return 0;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [difficulty, questionIndex]);

  return {
    question,
    countdown,
    isDynamicPopUp,
    mediaId,
    mediaType,
    showHint,
    selectedAnswer,
    isCorrect,
    handleFiftyFifty,
    handleAnswerSelection,
    handleNextQuestion,
    resetGame,
  };
};
