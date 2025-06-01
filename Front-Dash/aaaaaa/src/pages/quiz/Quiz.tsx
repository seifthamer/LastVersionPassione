import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../Store/axiosConfig';
import { MdAdd } from 'react-icons/md';
import Button from "react-bootstrap/Button";


interface Quiz {
  _id: string;
  title: string;
  category: string;
  questions: Array<{
    question: string;
    options: Array<{
      text: string;
      isCorrect: boolean;
    }>;
  }>;
}

interface NewQuiz {
  title: string;
  category: string;
  questions: Array<{
    question: string;
    options: Array<{
      text: string;
      isCorrect: boolean;
    }>;
  }>;
}

// Styled components
const Container = styled.div`
  padding:1rem 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin: 0;
`;



const QuizGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
 cursor:pointer;
`;

const QuizCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const QuizTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #333;
`;

const QuizCategory = styled.span`
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.875rem;
`;

const QuestionCount = styled.p`
  color: #666;
  margin: 0.5rem 0;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #4caf50;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #4caf50;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #4caf50;
  }
`;

const OptionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

const Checkbox = styled.input`
  margin: 0;
`;

const DetailsButton = styled(Button)`
  background-color: #2196f3;
  margin-top: 1rem;

  &:hover {
    background-color: #1976d2;
  }
`;

const DetailsModal = styled(Modal)``;

const DetailsContent = styled(ModalContent)`
  max-width: 800px;
`;

const QuestionList = styled.div`
  margin-top: 1rem;
`;

const QuestionItem = styled.div`
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const QuestionText = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #333;
`;

const OptionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const OptionItem = styled.li<{ $isCorrect: boolean }>`
  padding: 0.5rem;
  margin: 0.25rem 0;
  background: ${props => props.$isCorrect ? '#e8f5e9' : 'white'};
  border: 1px solid ${props => props.$isCorrect ? '#4caf50' : '#ddd'};
  border-radius: 4px;
  color: ${props => props.$isCorrect ? '#2e7d32' : '#333'};
`;

const Quiz = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [newQuiz, setNewQuiz] = useState<NewQuiz>({
    title: '',
    category: '',
    questions: [{ question: '', options: [{ text: '', isCorrect: false }] }]
  });

  useEffect(() => {
    fetchQuizzes();
  }, [searchTerm]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/quiz?search=${searchTerm}`);
      setQuizzes(response.data.quizzes);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to fetch quizzes');
      }
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axiosInstance.post('/quiz', newQuiz);
      toast.success('Quiz created successfully');
      setShowCreateModal(false);
      fetchQuizzes();
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to create quiz');
      }
      console.error('Error creating quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setNewQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, { question: '', options: [{ text: '', isCorrect: false }] }]
    }));
  };

  const addOption = (questionIndex: number) => {
    setNewQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[questionIndex].options.push({ text: '', isCorrect: false });
      return { ...prev, questions: updatedQuestions };
    });
  };

  const updateQuestion = (index: number, value: string) => {
    setNewQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index].question = value;
      return { ...prev, questions: updatedQuestions };
    });
  };

  const updateOption = (questionIndex: number, optionIndex: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    setNewQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      const option = updatedQuestions[questionIndex].options[optionIndex];
      if (field === 'text' && typeof value === 'string') {
        option.text = value;
      } else if (field === 'isCorrect' && typeof value === 'boolean') {
        option.isCorrect = value;
      }
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleViewDetails = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setShowDetailsModal(true);
  };

  return (
    <Container>
      <Header>
        <Title>Quizzes</Title>
        <Button
          variant="outline-success"
          className="rounded-pill px-4 py-2 d-flex align-items-center"
          style={{ boxShadow: "0 4px 10px rgba(0, 123, 255, 0.3)" }}
          onClick={() => setShowCreateModal(true)}
        >
          <MdAdd size={22} className="me-2" />
          <span className="fw-semibold">Créer Un Nouveau Quiz </span>
        </Button>
      </Header>

      <SearchBar
        type="text"
        placeholder="Search quizzes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <QuizGrid>
        {quizzes.map((quiz) => (
          <QuizCard key={quiz._id}>
            <QuizTitle>{quiz.title}</QuizTitle>
            <QuizCategory>{quiz.category}</QuizCategory>
            <QuestionCount>{quiz.questions.length} questions</QuestionCount>
            <DetailsButton onClick={() => handleViewDetails(quiz)}>
              View Details
            </DetailsButton>
          </QuizCard>
        ))}
      </QuizGrid>

      {showDetailsModal && selectedQuiz && (
        <DetailsModal>
          <DetailsContent>
            <h2>{selectedQuiz.title}</h2>
            <p>Category: {selectedQuiz.category}</p>
            <QuestionList>
              {selectedQuiz.questions.map((question, index) => (
                <QuestionItem key={index}>
                  <QuestionText>
                    Question {index + 1}: {question.question}
                  </QuestionText>
                  <OptionList>
                    {question.options.map((option, optIndex) => (
                      <OptionItem key={optIndex} $isCorrect={option.isCorrect}>
                        {option.text}
                        {option.isCorrect && " ✓"}
                      </OptionItem>
                    ))}
                  </OptionList>
                </QuestionItem>
              ))}
            </QuestionList>
            <Button onClick={() => setShowDetailsModal(false)}>Close</Button>
          </DetailsContent>
        </DetailsModal>
      )}

      {showCreateModal && (
        <Modal>
          <ModalContent>
            <h2>Create New Quiz</h2>
            <Form onSubmit={handleCreateQuiz}>
              <Input
                type="text"
                placeholder="Quiz Title"
                value={newQuiz.title}
                onChange={(e) =>
                  setNewQuiz((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
              <Input
                type="text"
                placeholder="Category"
                value={newQuiz.category}
                onChange={(e) =>
                  setNewQuiz((prev) => ({ ...prev, category: e.target.value }))
                }
                required
              />

              {newQuiz.questions.map((question, questionIndex) => (
                <div key={questionIndex}>
                  <TextArea
                    placeholder="Question"
                    value={question.question}
                    onChange={(e) =>
                      updateQuestion(questionIndex, e.target.value)
                    }
                    required
                  />

                  {question.options.map((option, optionIndex) => (
                    <OptionContainer key={optionIndex}>
                      <Input
                        type="text"
                        placeholder={`Option ${optionIndex + 1}`}
                        value={option.text}
                        onChange={(e) =>
                          updateOption(
                            questionIndex,
                            optionIndex,
                            "text",
                            e.target.value
                          )
                        }
                        required
                      />
                      <Checkbox
                        type="checkbox"
                        checked={option.isCorrect}
                        onChange={(e) =>
                          updateOption(
                            questionIndex,
                            optionIndex,
                            "isCorrect",
                            e.target.checked
                          )
                        }
                      />
                      <span>Correct Answer</span>
                    </OptionContainer>
                  ))}

                  <Button
                    type="button"
                    onClick={() => addOption(questionIndex)}
                  >
                    Add Option
                  </Button>
                </div>
              ))}

              <Button type="button" onClick={addQuestion}>
                Add Question
              </Button>

              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Quiz"}
              </Button>
              <Button type="button" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Quiz;
