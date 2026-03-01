import React, { useState, useEffect } from 'react';
import { PenTool, Clock, CheckCircle, AlertCircle, Send, FileText, Lock } from 'lucide-react';
import axios from 'axios';
import Timer from './Timer';
import './WritingModule.css';
import { toast } from 'react-toastify';

interface WritingTest {
  _id: string;
  task1: {
    title: string;
    time: string;
    wordCount: number;
    instructions: string;
    chartDescription: string;
  };
  task2: {
    title: string;
    time: string;
    wordCount: number;
    question: string;
    tips: string[];
  };
}

interface WritingModuleProps {
  onComplete: (results: {
    task1Score: number;
    task2Score: number;
    task1Response: string;
    task2Response: string;
    timeSpent: number;
    feedback?: {
      task1: any;
      task2: any;
    };
  }) => void;
}

const WritingModule: React.FC<WritingModuleProps> = ({ onComplete }) => {
  const [writingTest, setWritingTest] = useState<WritingTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<'task1' | 'task2'>('task1');
  
  const [task1Text, setTask1Text] = useState('');
  const [task2Text, setTask2Text] = useState('');
  
  const [task1WordCount, setTask1WordCount] = useState(0);
  const [task2WordCount, setTask2WordCount] = useState(0);
  
  const [submitting, setSubmitting] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  // Fetch writing test
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const baseUrl = import.meta.env?.VITE_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${baseUrl}/api/writing`);
        setWritingTest(response.data);
        toast.success('📋 Writing test loaded successfully!', {
          position: 'top-right',
          autoClose: 2000
        });
      } catch (error) {
        console.error('Error fetching writing test:', error);
        toast.error('❌ Failed to load writing test. Please check your connection.', {
          autoClose: 4000
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, []);

  // Auto-start timer when component loads
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Count words
  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Update word counts
  useEffect(() => {
    setTask1WordCount(countWords(task1Text));
  }, [task1Text]);

  useEffect(() => {
    setTask2WordCount(countWords(task2Text));
  }, [task2Text]);

  // Toast notifications for word count milestones
  useEffect(() => {
    if (!writingTest) return;

    // Task 1 milestone notifications
    if (task1WordCount === 50) {
      toast.info('💪 50 words written! Keep going!', { autoClose: 2000 });
    } else if (task1WordCount === 100) {
      toast.info('🎯 100 words! Almost there for Task 1!', { autoClose: 2000 });
    } else if (task1WordCount === writingTest.task1.wordCount) {
      toast.success('✅ Task 1 word count requirement met! You can now move to Task 2!', {
        autoClose: 3000
      });
    } else if (task1WordCount === 200) {
      toast.success('🌟 Excellent! You have more than enough words for Task 1!', {
        autoClose: 2000
      });
    }
  }, [task1WordCount, writingTest]);

  useEffect(() => {
    if (!writingTest) return;

    // Task 2 milestone notifications
    if (task2WordCount === 100) {
      toast.info('💪 100 words! Keep writing!', { autoClose: 2000 });
    } else if (task2WordCount === 200) {
      toast.info('🎯 200 words! Almost there for Task 2!', { autoClose: 2000 });
    } else if (task2WordCount === writingTest.task2.wordCount) {
      toast.success('✅ Task 2 word count requirement met! Great job!', {
        autoClose: 3000
      });
    } else if (task2WordCount === 300) {
      toast.success('🌟 Excellent essay length!', { autoClose: 2000 });
    }
  }, [task2WordCount, writingTest]);

  // Handle text changes
  const handleTask1Change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTask1Text(e.target.value);
  };

  const handleTask2Change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTask2Text(e.target.value);
  };

  // Check if Task 1 is complete
  const isTask1Complete = () => {
    return writingTest && task1WordCount >= writingTest.task1.wordCount;
  };

  // Handle task switching
  const handleTaskSwitch = (task: 'task1' | 'task2') => {
    if (task === 'task2' && !isTask1Complete()) {
      toast.warn(`⚠️ Please complete Task 1 first!\n\nYou need at least ${writingTest?.task1.wordCount} words. You have ${task1WordCount} words.`, {
        autoClose: 4000
      });
      return;
    }
    
    setActiveTask(task);
    
    if (task === 'task1') {
      toast.info('📝 Switched to Task 1 - Report Writing', {
        autoClose: 2000
      });
    } else {
      toast.info('✍️ Switched to Task 2 - Essay Writing', {
        autoClose: 2000
      });
    }
  };

  // Evaluate Task 1
  const evaluateTask1 = (response: string): number => {
    const wordCount = response.trim().split(/\s+/).length;
    const hasIntroduction = response.toLowerCase().includes('chart') || 
                           response.toLowerCase().includes('graph') || 
                           response.toLowerCase().includes('table');
    const hasOverview = response.toLowerCase().includes('overall') || 
                       response.toLowerCase().includes('in general');
    const hasData = /\d+/.test(response);
    const hasComparisons = response.includes('than') || 
                          response.includes('compared') || 
                          response.includes('whereas');
    
    let score = 4.0;
    
    if (wordCount >= 150) score += 0.5;
    if (wordCount >= 170) score += 0.5;
    if (hasIntroduction) score += 0.5;
    if (hasOverview) score += 0.5;
    if (hasData) score += 0.5;
    if (hasComparisons) score += 0.5;
    if (wordCount > 200) score += 0.5;
    
    return Math.min(score, 9.0);
  };

  // Evaluate Task 2
  const evaluateTask2 = (response: string): number => {
    const wordCount = response.trim().split(/\s+/).length;
    const paragraphs = response.split('\n\n').filter(p => p.trim().length > 0).length;
    const hasPosition = response.toLowerCase().includes('agree') || 
                       response.toLowerCase().includes('disagree') || 
                       response.toLowerCase().includes('believe') || 
                       response.toLowerCase().includes('opinion');
    const hasExamples = response.toLowerCase().includes('example') || 
                       response.toLowerCase().includes('instance');
    const hasConclusion = response.toLowerCase().includes('conclusion') || 
                         response.toLowerCase().includes('summary');
    
    let score = 4.0;
    
    if (wordCount >= 250) score += 0.5;
    if (wordCount >= 280) score += 0.5;
    if (paragraphs >= 4) score += 0.5;
    if (hasPosition) score += 1.0;
    if (hasExamples) score += 0.5;
    if (hasConclusion) score += 0.5;
    if (wordCount > 320) score += 0.5;
    
    return Math.min(score, 9.0);
  };

  // Submit test
  const handleSubmit = () => {
    if (!writingTest) return;

    // Validation checks
    if (task1WordCount < writingTest.task1.wordCount) {
      toast.error(`❌ Task 1 requires at least ${writingTest.task1.wordCount} words. You have ${task1WordCount} words.`, {
        autoClose: 4000
      });
      return;
    }

    if (task2WordCount < writingTest.task2.wordCount) {
      toast.error(`❌ Task 2 requires at least ${writingTest.task2.wordCount} words. You have ${task2WordCount} words.`, {
        autoClose: 4000
      });
      return;
    }

    // Check if both tasks have content
    if (!task1Text.trim()) {
      toast.error('❌ Please write your response for Task 1!', {
        autoClose: 3000
      });
      return;
    }

    if (!task2Text.trim()) {
      toast.error('❌ Please write your response for Task 2!', {
        autoClose: 3000
      });
      return;
    }

    setSubmitting(true);

    // Show submitting toast
    const submittingToast = toast.loading('📤 Submitting your writing test...', {
      position: 'top-center'
    });

    (async () => {
      try {
        const task1Score = evaluateTask1(task1Text);
        const task2Score = evaluateTask2(task2Text);

        const baseUrl = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

        // Call backend to get detailed feedback (Gemini) for each task
        const [res1, res2] = await Promise.all([
          fetch(`${baseUrl}/api/writing/evaluate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: task1Text, taskType: 'task1' })
          }).then(r => r.json()).catch(() => null),
          fetch(`${baseUrl}/api/writing/evaluate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: task2Text, taskType: 'task2' })
          }).then(r => r.json()).catch(() => null)
        ]);

        const task1Feedback = res1 && (res1.feedback || res1) ? (res1.feedback || res1) : null;
        const task2Feedback = res2 && (res2.feedback || res2) ? (res2.feedback || res2) : null;

        // Update toast to success
        toast.update(submittingToast, {
          render: '✅ Writing test submitted successfully!',
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });

        // Show scores preview
        setTimeout(() => {
          toast.info(`📊 Task 1 Score: ${task1Score.toFixed(1)} | Task 2 Score: ${task2Score.toFixed(1)}`, {
            autoClose: 5000
          });
        }, 500);

        onComplete({
          task1Score,
          task2Score,
          task1Response: task1Text,
          task2Response: task2Text,
          timeSpent,
          feedback: {
            task1: task1Feedback,
            task2: task2Feedback
          }
        });
      } catch (err) {
        console.error('Error submitting writing evaluation:', err);
        toast.update(submittingToast, {
          render: '⚠️ Submission completed but feedback unavailable',
          type: 'warning',
          isLoading: false,
          autoClose: 4000
        });

        const task1Score = evaluateTask1(task1Text);
        const task2Score = evaluateTask2(task2Text);
        onComplete({
          task1Score,
          task2Score,
          task1Response: task1Text,
          task2Response: task2Text,
          timeSpent
        });
      } finally {
        setSubmitting(false);
      }
    })();
  };

  // Time up handler
  const handleTimeUp = () => {
    toast.error('⏰ Time is up! Your test will be submitted automatically.', {
      autoClose: 3000,
      position: 'top-center'
    });
    
    setTimeout(() => {
      handleSubmit();
    }, 1000);
  };

  // Get progress percentage
  const getProgress = (current: number, required: number) => {
    return Math.min((current / required) * 100, 100);
  };

  if (loading) {
    return (
      <div className="writing-loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading Writing Test...</p>
      </div>
    );
  }

  if (!writingTest) {
    return (
      <div className="writing-error-container max-w-4xl mx-auto px-6">
        <AlertCircle className="error-icon" />
        <h2>No Writing Test Available</h2>
        <p>Please contact support or try again later.</p>
      </div>
    );
  }

  return (
    <div className="writing-module-container">
      {/* Top Header Bar */}
      <div className="writing-top-bar">
        <div className="top-bar-left">
          <div className="logo-section">
            <PenTool className="logo-icon" />
            <div>
              <h1 className="module-title">IELTS Writing Test</h1>
              <p className="module-subtitle">Academic Module • 60 Minutes</p>
            </div>
          </div>
        </div>

        <div className="top-bar-right">
          <div className="timer-container">
            <Clock className="timer-icon" />
            <Timer duration={3600} onTimeUp={handleTimeUp} />
          </div>
        </div>
      </div>

      {/* Progress Overview Bar */}
      <div className="progress-overview-bar">
        <div className="progress-card">
          <div className="progress-header">
            <FileText size={20} />
            <span>Task 1 Progress</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill"
              style={{ 
                width: `${getProgress(task1WordCount, writingTest.task1.wordCount)}%`,
                backgroundColor: task1WordCount >= writingTest.task1.wordCount ? '#10b981' : '#3b82f6'
              }}
            />
          </div>
          <div className="progress-info">
            <span className={task1WordCount >= writingTest.task1.wordCount ? 'complete' : 'incomplete'}>
              {task1WordCount} / {writingTest.task1.wordCount} words
            </span>
            {task1WordCount >= writingTest.task1.wordCount && (
              <CheckCircle className="check-icon" size={16} />
            )}
          </div>
        </div>

        <div className="progress-card">
          <div className="progress-header">
            <FileText size={20} />
            <span>Task 2 Progress</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill"
              style={{ 
                width: `${getProgress(task2WordCount, writingTest.task2.wordCount)}%`,
                backgroundColor: task2WordCount >= writingTest.task2.wordCount ? '#10b981' : '#3b82f6'
              }}
            />
          </div>
          <div className="progress-info">
            <span className={task2WordCount >= writingTest.task2.wordCount ? 'complete' : 'incomplete'}>
              {task2WordCount} / {writingTest.task2.wordCount} words
            </span>
            {task2WordCount >= writingTest.task2.wordCount && (
              <CheckCircle className="check-icon" size={16} />
            )}
          </div>
        </div>
      </div>

      {/* Task Navigation Tabs */}
      <div className="task-tabs-premium">
        <button
          onClick={() => handleTaskSwitch('task1')}
          className={`tab-premium ${activeTask === 'task1' ? 'active' : ''}`}
        >
          <div className="tab-content">
            <div className="tab-header">
              <span className="tab-number">Task 1</span>
              <span className="tab-time">20 min</span>
            </div>
            <div className="tab-subtitle">Report Writing</div>
            <div className="tab-word-count">
              <span className={task1WordCount >= writingTest.task1.wordCount ? 'sufficient' : 'insufficient'}>
                {task1WordCount} words
              </span>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleTaskSwitch('task2')}
          className={`tab-premium ${activeTask === 'task2' ? 'active' : ''} ${!isTask1Complete() ? 'locked' : ''}`}
          disabled={!isTask1Complete()}
          {...(!isTask1Complete() && { 
            title: `⚠️ Complete Task 1 first (${task1WordCount}/${writingTest.task1.wordCount} words)` 
          })}
        >
          <div className="tab-content">
            <div className="tab-header">
              <span className="tab-number">
                {!isTask1Complete() && <Lock size={14} className="inline mr-1" />}
                Task 2
              </span>
              <span className="tab-time">40 min</span>
            </div>
            <div className="tab-subtitle">Essay Writing</div>
            <div className="tab-word-count">
              {!isTask1Complete() ? (
                <span className="locked-text">Complete Task 1 first</span>
              ) : (
                <span className={task2WordCount >= writingTest.task2.wordCount ? 'sufficient' : 'insufficient'}>
                  {task2WordCount} words
                </span>
              )}
            </div>
          </div>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="writing-content-grid">
        {/* Task 1 */}
        {activeTask === 'task1' && (
          <>
            <div className="instructions-panel">
              <div className="panel-header">
                <h2 className="panel-title">{writingTest.task1.title}</h2>
                <div className="task-meta-badges">
                  <span className="meta-badge time">
                    <Clock size={14} />
                    {writingTest.task1.time}
                  </span>
                  <span className="meta-badge words">
                    <FileText size={14} />
                    Min. {writingTest.task1.wordCount} words
                  </span>
                </div>
              </div>

              <div className="instructions-box">
                <div className="instructions-header">
                  <span className="instructions-label">📋 Instructions</span>
                </div>
                <p className="instructions-text">{writingTest.task1.instructions}</p>
              </div>

              <div className="chart-data-box">
                <div className="chart-header">
                  <span className="chart-label">📊 Chart Data</span>
                </div>
                <pre className="chart-content">{writingTest.task1.chartDescription}</pre>
              </div>

              <div className="tips-box task1-tips">
                <h4>💡 Writing Tips for Task 1:</h4>
                <ul>
                  <li>Start with an overview of the main trends</li>
                  <li>Use specific data from the chart</li>
                  <li>Make comparisons between countries</li>
                  <li>Use appropriate linking words</li>
                </ul>
              </div>
            </div>

            <div className="response-panel">
              <div className="response-header">
                <h3 className="response-title">Your Response</h3>
                <div className="word-counter-badge">
                  <span className={`counter-number ${task1WordCount >= writingTest.task1.wordCount ? 'complete' : 'incomplete'}`}>
                    {task1WordCount}
                  </span>
                  <span className="counter-label">
                    / {writingTest.task1.wordCount} words
                  </span>
                </div>
              </div>

              <textarea
                value={task1Text}
                onChange={handleTask1Change}
                disabled={submitting}
                className="response-textarea-premium"
                placeholder="Begin typing your response here... 
                
Remember to:
• Paraphrase the question in your introduction
• Describe the main features and trends
• Include specific data from the chart
• Make relevant comparisons
• Write at least 150 words"
                autoFocus
              />

              <div className="textarea-footer">
                <div className="footer-stats">
                  {task1WordCount < writingTest.task1.wordCount ? (
                    <span className="words-needed">
                      {writingTest.task1.wordCount - task1WordCount} more words needed
                    </span>
                  ) : (
                    <span className="words-complete">
                      ✓ Word count requirement met - You can now move to Task 2
                    </span>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Task 2 */}
        {activeTask === 'task2' && (
          <>
            <div className="instructions-panel">
              <div className="panel-header">
                <h2 className="panel-title">{writingTest.task2.title}</h2>
                <div className="task-meta-badges">
                  <span className="meta-badge time">
                    <Clock size={14} />
                    {writingTest.task2.time}
                  </span>
                  <span className="meta-badge words">
                    <FileText size={14} />
                    Min. {writingTest.task2.wordCount} words
                  </span>
                </div>
              </div>

              <div className="question-box">
                <div className="question-header">
                  <span className="question-label">📝 Essay Question</span>
                </div>
                <p className="question-text">{writingTest.task2.question}</p>
              </div>

              {writingTest.task2.tips && writingTest.task2.tips.length > 0 && (
                <div className="tips-box task2-tips">
                  <h4>💡 Writing Tips for Task 2:</h4>
                  <ul>
                    {writingTest.task2.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="structure-guide">
                <h4>📚 Suggested Essay Structure:</h4>
                <div className="structure-steps">
                  <div className="structure-step">
                    <span className="step-number">1</span>
                    <span className="step-text">Introduction (40-50 words)</span>
                  </div>
                  <div className="structure-step">
                    <span className="step-number">2</span>
                    <span className="step-text">Body Paragraph 1 (70-80 words)</span>
                  </div>
                  <div className="structure-step">
                    <span className="step-number">3</span>
                    <span className="step-text">Body Paragraph 2 (70-80 words)</span>
                  </div>
                  <div className="structure-step">
                    <span className="step-number">4</span>
                    <span className="step-text">Conclusion (40-50 words)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="response-panel">
              <div className="response-header">
                <h3 className="response-title">Your Essay</h3>
                <div className="word-counter-badge">
                  <span className={`counter-number ${task2WordCount >= writingTest.task2.wordCount ? 'complete' : 'insufficient'}`}>
                    {task2WordCount}
                  </span>
                  <span className="counter-label">
                    / {writingTest.task2.wordCount} words
                  </span>
                </div>
              </div>

              <textarea
                value={task2Text}
                onChange={handleTask2Change}
                disabled={submitting}
                className="response-textarea-premium"
                placeholder="Begin writing your essay here...

Remember to:
• Clearly state your position
• Discuss both views if required
• Support your arguments with examples
• Organize your essay into clear paragraphs
• Write a strong conclusion
• Write at least 250 words"
                autoFocus
              />

              <div className="textarea-footer">
                <div className="footer-stats">
                  {task2WordCount < writingTest.task2.wordCount ? (
                    <span className="words-needed">
                      {writingTest.task2.wordCount - task2WordCount} more words needed
                    </span>
                  ) : (
                    <span className="words-complete">
                      ✓ Word count requirement met
                    </span>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Submit Button */}
      <div className="action-buttons-container">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-action btn-submit btn-full-width"
        >
          <Send size={18} />
          {submitting ? 'Submitting...' : 'Complete Writing Test'}
        </button>
      </div>
    </div>
  );
};

export default WritingModule;
