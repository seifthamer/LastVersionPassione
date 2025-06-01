import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import "katex/dist/katex.min.css";
import styled from "styled-components";
import axios from "axios";
import { toast } from "react-toastify";

// Styled components
const EditorContainer = styled.div`
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const SaveButton = styled.button`
  background-color: #4caf50;
  color: white;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 20px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 16px;
  display: flex;
  align-self: flex-end;

  &:hover {
    background-color: #45a049;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
`;

const ConditionDutilisateur = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      hljs.configure({
        languages: [
          "javascript",
          "typescript",
          "html",
          "css",
          "json",
          "python",
          "java",
          "c",
          "cpp",
        ],
      });

      const toolbarOptions = [
        [{ font: [] }, { size: [] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ script: "sub" }, { script: "super" }],
        [{ header: 1 }, { header: 2 }, "blockquote", "code-block"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        [{ direction: "rtl" }, { align: [] }],
        ["link", "image", "video", "formula"],
        ["clean"],
      ];

      quillRef.current = new Quill(editorRef.current, {
        modules: {
          toolbar: toolbarOptions,
          syntax: {
            highlight: (text: string) => hljs.highlightAuto(text).value,
          },
        },
        theme: "snow",
      });

      // Fetch initial content
      fetchContent();
    }

    return () => {
      quillRef.current = null;
    };
  }, []);

  const fetchContent = async () => {
    try {
      const response = await axios.get('http://localhost:5000/sidebar/condition');
      if (response.data && response.data.content && quillRef.current) {
        quillRef.current.root.innerHTML = response.data.content;
      }
    } catch (error) {
      console.error('Error fetching condition content:', error);
      toast.error('Failed to load content');
    }
  };

  const handleSave = async () => {
    if (!quillRef.current) return;

    setLoading(true);
    try {
      const content = quillRef.current.root.innerHTML;
      
      // Check content size (rough estimate)
      const contentSize = new Blob([content]).size;
      const maxSize = 1024 * 1024; // 1MB limit
      
      if (contentSize > maxSize) {
        toast.error('Content is too large. Please reduce the content size.');
        setLoading(false);
        return;
      }

      await axios.put('http://localhost:5000/sidebar/condition', { content }, {
        headers: {
          'Content-Type': 'application/json',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      
      toast.success('Content saved successfully');
    } catch (error: any) {
      console.error('Error saving content:', error);
      if (error.response?.status === 413) {
        toast.error('Content is too large. Please reduce the content size.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to save content');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 style={{marginTop:"0.rem"}}>Condition D'utilisateur</h1>
      <EditorContainer>
        <div ref={editorRef} />
        <ButtonContainer>
          <SaveButton onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Sauvegarder les conditions'}
          </SaveButton>
        </ButtonContainer>
      </EditorContainer>
    </>
  );
};

export default ConditionDutilisateur;
