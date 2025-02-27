import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";
import YouTube from "react-youtube";
import { useParams, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { db, getDoc, setDoc, doc } from "./firebase-config";
import { updateDoc, increment } from "firebase/firestore";
import { fetchVideoCount } from "./services/viewCounterService";
import { extractTranscript } from "./utils";
import axios from "axios";

const LearnVideo = () => {
  const { videoId } = useParams();
  const location = useLocation();
  const { videoInfo } = location.state || {};
  console.log("videoInfo", videoInfo);
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [count, setCount] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});

  const transcript = JSON.stringify(videoInfo.translated_transcript);
  const translatedTranscriptText = extractTranscript(
    videoInfo.translated_transcript
  );
  const originalTranscriptText = extractTranscript(
    videoInfo.original_transcript
  );
  console.log(videoInfo);
  // YouTube player options
  const opts = {
    height: "390",
    width: "640",
    playerVars: {
      autoplay: 1, // Autoplay the video
    },
  };

  const convertToCEFR = (level) => {
    const intLevel = parseInt(level, 10);
    const levels = ["A1", "A2", "B1", "B2", "C1", "C2", "Unknown"];
    return levels[intLevel] || "Unknown";
  };

  const recordHistory = async () => {
    console.log(`Recording video ${videoId} watch history...`);

    try {
      const userRef = doc(db, "users", user.sub);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const history = userDoc.data().history || {};

        if (history[videoId]) {
          history[videoId] += 1;
        } else {
          history[videoId] = 1;
        }

        await updateDoc(userRef, {
          history: history,
        });

        console.log(
          `Video ${videoId} watch history updated. Current count: ${history[videoId]}`
        );
        setCount(history[videoId]);
      } else {
        console.log("User document does not exist.");
      }
    } catch (error) {
      console.error("Error updating watch history:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.sub) {
      const getVideoCount = async () => {
        const videoCount = await fetchVideoCount(user.sub, videoId); // Use the imported function
        setCount(videoCount); // Set the count from the fetched data
      };

      getVideoCount();
    }
  }, [videoId, isAuthenticated, user?.sub]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/find_questions",
          {
            transcript: transcript,
          }
        );
        setQuestions(response.data.questions.split("\n"));
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    if (transcript) {
      fetchQuestions();
    }
  }, [transcript]);

  const handleResponseChange = (index, value) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [index]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const userRef = doc(db, "users", user.sub);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const videoResponses = userData.videoResponses || {};

        videoResponses[videoId] = {
          questions: questions,
          responses: responses,
        };

        await updateDoc(userRef, {
          videoResponses: videoResponses,
        });

        console.log("Responses saved successfully.");
      } else {
        console.log("User document does not exist.");
      }
    } catch (error) {
      console.error("Error saving responses:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Container
      style={{
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Row>
        <Col xs="12" md="8" className="mx-auto">
          <Card>
            <CardBody style={{ textAlign: "left" }}>
              <YouTube videoId={videoId} opts={opts} onEnd={recordHistory} />
              <CardText>
                <strong
                  style={{
                    fontSize: "1.5rem",
                    display: "block",
                    marginBottom: "10px",
                  }}
                >
                  General Level:{" "}
                  <span style={{ color: "#007bff" }}>
                    {convertToCEFR(videoInfo.final_levels?.general_level)}
                  </span>
                </strong>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, auto)",
                    gap: "10px",
                    padding: "10px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <div>
                    <strong>Vocabulary Level:</strong>{" "}
                    {videoInfo.final_levels?.vocabulary_level ?? "N/A"}
                  </div>
                  <div>
                    <strong>Tense Level:</strong>{" "}
                    {videoInfo.final_levels?.tense_level ?? "N/A"}
                  </div>
                  <div>
                    <strong>Clause Level:</strong>{" "}
                    {videoInfo.final_levels?.clause_level ?? "N/A"}
                  </div>
                  <div>
                    <strong>Sentence Level:</strong>{" "}
                    {videoInfo.final_levels?.sentence_level ?? "N/A"}
                  </div>
                </div>
              </CardText>
              <CardText>
                <strong>Times Watched:</strong> {count}
              </CardText>
              <CardTitle className="mt-4" style={{ fontWeight: "bold" }}>
                Translated Transcript
              </CardTitle>
              <CardText>
                <pre>{translatedTranscriptText}</pre>
              </CardText>
              <CardTitle className="mt-4" style={{ fontWeight: "bold" }}>
                Original Transcript
              </CardTitle>
              <CardText>
                <pre>{originalTranscriptText}</pre>
              </CardText>
              <CardTitle className="mt-4" style={{ fontWeight: "bold" }}>
                Questions
              </CardTitle>
              <Form>
                {Array.isArray(questions) &&
                  questions.map((question, index) => (
                    <FormGroup key={index}>
                      <Label for={`question-${index}`}>{question}</Label>
                      <Input
                        type="text"
                        name={`question-${index}`}
                        id={`question-${index}`}
                        value={responses[index] || ""}
                        onChange={(e) =>
                          handleResponseChange(index, e.target.value)
                        }
                      />
                    </FormGroup>
                  ))}
                <Button color="primary" onClick={handleSubmit}>
                  Submit
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LearnVideo;
