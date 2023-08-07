import React, { useState } from "react";
import "./contact.css";

function Contact() {
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3070/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatusMessage({
          text: "Thank you! We will contact you soon",
          type: "success",
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
        });
      } else {
        const responseBody = await response.json();
        setStatusMessage(responseBody.message || "Failed to send the email.");
      }
    } catch (error) {
      setStatusMessage("There was an error sending the email.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="forrm-container">
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        required
        className="forrm-input"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
        className="forrm-input"
      />
      <input
        type="tel"
        name="phone"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={handleChange}
        className="forrm-input"
      />
      <textarea
        name="message"
        placeholder="Your Message"
        value={formData.message}
        onChange={handleChange}
        className="forrm-textarea"
        required
      />
      <input type="submit" value="Submit" className="forrm-button" />
      <div
        className={`status-message ${
          statusMessage.type === "success" ? "status-success" : "status-error"
        }`}
      >
        {statusMessage.text}
      </div>
    </form>
  );
}

export default Contact;
