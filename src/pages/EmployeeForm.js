import "../styles/Forms.css";
import { useState } from "react";

export default function EmployeeForm() {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    alert("Form submitted! (Mock)");
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>Employee Experience Survey</h2>
        <p>Please fill out this form to share your experience at the company.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 1. Basic Info */}
        <div className="question-block">
          <label>Full Name</label>
          <input name="name" onChange={handleChange} />
        </div>

        <div className="question-block">
          <label>Email Address</label>
          <input name="email" type="email" onChange={handleChange} />
        </div>

        <div className="question-block">
          <label>Department</label>
          <select name="department" onChange={handleChange}>
            <option>Choose...</option>
            <option>Engineering</option>
            <option>Design</option>
            <option>Marketing</option>
            <option>HR</option>
          </select>
        </div>

        {/* 2. Likert / MCQ */}
        <div className="question-block">
          <label>How satisfied are you with your current role?</label>
          <div className="radio-group">
            {[1,2,3,4,5].map(v => (
              <label key={v}>
                <input type="radio" name="roleSatisfaction" value={v} onChange={handleChange} />
                {v} / 5
              </label>
            ))}
          </div>
        </div>

        <div className="question-block">
          <label>What motivates you most at work?</label>
          <div className="checkbox-group">
            <label><input type="checkbox" name="motivation" value="Teamwork" /> Teamwork</label>
            <label><input type="checkbox" name="motivation" value="Recognition" /> Recognition</label>
            <label><input type="checkbox" name="motivation" value="Growth" /> Growth</label>
            <label><input type="checkbox" name="motivation" value="Salary" /> Salary</label>
          </div>
        </div>

        {/* 3. Open-ended */}
        <div className="question-block">
          <label>What do you think could be improved in your department?</label>
          <textarea name="improvement" rows="3" onChange={handleChange}></textarea>
        </div>

        {/* 4. More questions */}
        <div className="question-block">
          <label>How often do you receive feedback?</label>
          <select name="feedbackFreq" onChange={handleChange}>
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Quarterly</option>
            <option>Rarely</option>
          </select>
        </div>

        <div className="question-block">
          <label>Rate the overall work-life balance</label>
          <div className="radio-group">
            {[1,2,3,4,5].map(v => (
              <label key={v}>
                <input type="radio" name="workLifeBalance" value={v} onChange={handleChange} />
                {v} / 5
              </label>
            ))}
          </div>
        </div>

        <div className="question-block">
          <label>Would you recommend this company to others?</label>
          <div className="radio-group">
            <label><input type="radio" name="recommend" value="Yes" /> Yes</label>
            <label><input type="radio" name="recommend" value="No" /> No</label>
          </div>
        </div>

        <div className="question-block">
          <label>Any additional comments?</label>
          <textarea name="comments" rows="4" onChange={handleChange}></textarea>
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
