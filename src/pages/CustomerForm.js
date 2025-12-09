import "../styles/Forms.css";
import { useState } from "react";

export default function CustomerForm() {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Customer Form Submitted:", formData);
    alert("Customer form submitted successfully! (Mock submission)");
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>Customer Feedback Form</h2>
        <p>
          We value your opinion! Please take a few minutes to fill out this
          feedback form to help us improve our products and services.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 1. Basic Info */}
        <div className="question-block">
          <label>Full Name</label>
          <input type="text" name="name" onChange={handleChange} />
        </div>

        <div className="question-block">
          <label>Email Address</label>
          <input type="email" name="email" onChange={handleChange} />
        </div>

        <div className="question-block">
          <label>Age Range</label>
          <select name="ageRange" onChange={handleChange}>
            <option>Choose...</option>
            <option>Under 18</option>
            <option>18–25</option>
            <option>26–35</option>
            <option>36–50</option>
            <option>51+</option>
          </select>
        </div>

        {/* 2. Customer Experience */}
        <div className="question-block">
          <label>How did you first hear about us?</label>
          <select name="referral" onChange={handleChange}>
            <option>Choose...</option>
            <option>Social Media</option>
            <option>Friend / Family</option>
            <option>Online Search</option>
            <option>Advertisement</option>
            <option>Other</option>
          </select>
        </div>

        <div className="question-block">
          <label>How often do you use our products/services?</label>
          <div className="radio-group">
            <label><input type="radio" name="usage" value="Daily" onChange={handleChange}/> Daily</label>
            <label><input type="radio" name="usage" value="Weekly" onChange={handleChange}/> Weekly</label>
            <label><input type="radio" name="usage" value="Monthly" onChange={handleChange}/> Monthly</label>
            <label><input type="radio" name="usage" value="Rarely" onChange={handleChange}/> Rarely</label>
          </div>
        </div>

        <div className="question-block">
          <label>How satisfied are you with our product quality?</label>
          <div className="radio-group">
            {[1, 2, 3, 4, 5].map(v => (
              <label key={v}>
                <input type="radio" name="quality" value={v} onChange={handleChange}/>
                {v} / 5
              </label>
            ))}
          </div>
        </div>

        <div className="question-block">
          <label>How would you rate our customer service?</label>
          <div className="radio-group">
            {[1, 2, 3, 4, 5].map(v => (
              <label key={v}>
                <input type="radio" name="service" value={v} onChange={handleChange}/>
                {v} / 5
              </label>
            ))}
          </div>
        </div>

        <div className="question-block">
          <label>Have you faced any issues using our products?</label>
          <div className="radio-group">
            <label><input type="radio" name="issues" value="Yes" onChange={handleChange}/> Yes</label>
            <label><input type="radio" name="issues" value="No" onChange={handleChange}/> No</label>
          </div>
        </div>

        <div className="question-block">
          <label>If yes, please describe the issue.</label>
          <textarea name="issueDescription" rows="3" onChange={handleChange}></textarea>
        </div>

        {/* 3. Preferences */}
        <div className="question-block">
          <label>Which product features do you find most useful? (Select all that apply)</label>
          <div className="checkbox-group">
            <label><input type="checkbox" name="features" value="Ease of use" /> Ease of use</label>
            <label><input type="checkbox" name="features" value="Design" /> Design</label>
            <label><input type="checkbox" name="features" value="Speed" /> Speed</label>
            <label><input type="checkbox" name="features" value="Reliability" /> Reliability</label>
            <label><input type="checkbox" name="features" value="Support" /> Support</label>
          </div>
        </div>

        <div className="question-block">
          <label>How likely are you to recommend us to a friend?</label>
          <div className="radio-group">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
              <label key={v}>
                <input type="radio" name="recommend" value={v} onChange={handleChange}/>
                {v} / 10
              </label>
            ))}
          </div>
        </div>

        <div className="question-block">
          <label>Which communication channels do you prefer for updates?</label>
          <div className="checkbox-group">
            <label><input type="checkbox" name="channels" value="Email" /> Email</label>
            <label><input type="checkbox" name="channels" value="SMS" /> SMS</label>
            <label><input type="checkbox" name="channels" value="Phone" /> Phone</label>
            <label><input type="checkbox" name="channels" value="Social Media" /> Social Media</label>
          </div>
        </div>

        <div className="question-block">
          <label>What improvements would you like to see?</label>
          <textarea name="improvements" rows="4" onChange={handleChange}></textarea>
        </div>

        <div className="question-block">
          <label>Rate the website navigation experience</label>
          <div className="radio-group">
            {[1, 2, 3, 4, 5].map(v => (
              <label key={v}>
                <input type="radio" name="navigation" value={v} onChange={handleChange}/>
                {v} / 5
              </label>
            ))}
          </div>
        </div>

        <div className="question-block">
          <label>How likely are you to purchase again?</label>
          <select name="repurchase" onChange={handleChange}>
            <option>Choose...</option>
            <option>Very likely</option>
            <option>Likely</option>
            <option>Unsure</option>
            <option>Unlikely</option>
          </select>
        </div>

        {/* 4. Ratings / Open-ended */}
        <div className="question-block">
          <label>Rate the value for money of our products</label>
          <div className="radio-group">
            {[1, 2, 3, 4, 5].map(v => (
              <label key={v}>
                <input type="radio" name="value" value={v} onChange={handleChange}/>
                {v} / 5
              </label>
            ))}
          </div>
        </div>

        <div className="question-block">
          <label>Do you follow our social media pages?</label>
          <div className="radio-group">
            <label><input type="radio" name="socialMedia" value="Yes" onChange={handleChange}/> Yes</label>
            <label><input type="radio" name="socialMedia" value="No" onChange={handleChange}/> No</label>
          </div>
        </div>

        <div className="question-block">
          <label>What would make you recommend us more confidently?</label>
          <textarea name="confidenceReason" rows="3" onChange={handleChange}></textarea>
        </div>

        <div className="question-block">
          <label>Additional Comments</label>
          <textarea name="comments" rows="3" onChange={handleChange}></textarea>
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
