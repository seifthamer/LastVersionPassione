import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import "katex/dist/katex.min.css";
import styled from "styled-components";
import axiosInstance from "../../Store/axiosConfig";
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

const Apropos = () => {
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
          toolbar: {
            container: toolbarOptions,
            handlers: {
              image: function() {
                const input = document.createElement('input');
                input.setAttribute('type', 'file');
                input.setAttribute('accept', 'image/*');
                input.click();

                input.onchange = async () => {
                  const file = input.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const img = new Image();
                      img.onload = () => {
                        const range = quillRef.current?.getSelection(true);
                        if (range) {
                          quillRef.current?.insertEmbed(range.index, 'image', e.target?.result, 'user');
                          quillRef.current?.formatText(range.index, 1, {
                            width: "250px",
                            height: "250px"
                          });
                        }
                      };
                      img.src = e.target?.result as string;
                    };
                    reader.readAsDataURL(file);
                  }
                };
              }
            }
          },
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
      const response = await axiosInstance.get('/sidebar/about');
      if (response.data && response.data.content && quillRef.current) {
        quillRef.current.root.innerHTML = response.data.content;
      }
    } catch (error) {
      console.error('Error fetching about content:', error);
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

      await axiosInstance.put('/sidebar/about', 
        { content }, 
        {
          headers: {
            'Content-Type': 'application/json',
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );
      
      toast.success('Content saved successfully');
    } catch (error) {
      console.error('Error saving content:', error);
      if (error.response?.status === 413) {
        toast.error('Content is too large. Please reduce the content size.');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to save content');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 style={{ marginTop: "0.7rem" }}>A propos</h1>
      <EditorContainer>
        <div ref={editorRef} />
        <ButtonContainer>
          <SaveButton onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Sauvegarder à propos'}
          </SaveButton>
        </ButtonContainer>
      </EditorContainer>
    </>
  );
};

export default Apropos;
