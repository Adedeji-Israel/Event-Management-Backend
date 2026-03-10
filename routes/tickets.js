const express = require("express");
const TicketCollection = require("../models/ticket");
const EventCollection = require("../models/event");
const { getAllTickets, bookTicket, getMyTickets, getPaymentStatus, getBookedTickets, } = require("../controllers/tickets");
const { authorize, authMiddleware, } = require("../middlewares/auth");
const generateTicketPDF = require("../utils/generateTicketPDF");

const router = express.Router();

// ADMIN
router.get("/", authMiddleware, authorize("admin"), getAllTickets);

// ORGANIZER 
router.get("/booked-tickets", authMiddleware, authorize("organizer"), getBookedTickets);

// USER
router.get("/my-tickets", authMiddleware, authorize("user"), getMyTickets);
router.get("/:ticketId/download/pdf", authMiddleware, authorize("user"), async (req, res) => {
  try {
    const ticket = await TicketCollection.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const event = await EventCollection.findById(ticket.event);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // This now returns a Buffer
    const pdfBuffer = await generateTicketPDF(ticket.toObject(), event);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${ticket.ticketId}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer); // ✅ SEND BUFFER DIRECTLY 

  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
}); 

// PAYSTACK PAYMENT CALLBACK
router.post("/book/:eventId", authMiddleware, authorize("user"), bookTicket);
router.get("/payment/confirm", authMiddleware, authorize("user"), getPaymentStatus);

module.exports = router
