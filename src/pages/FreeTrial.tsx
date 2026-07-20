
import React, { useState, CSSProperties } from "react";

import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Stack,
  Chip,
  Card,
  CardContent,
  Avatar,
  InputAdornment
} from "@mui/material";

import {
  Wifi,
  RocketLaunch,

  Verified,
  Speed,
  Security,
  SupportAgent,
  ArrowForward,
  CheckCircle,
  Star,
  Home,
  LocationOn,
  Phone,
  Email,
  Person
} from "@mui/icons-material";

import { motion } from "framer-motion";

import { ref, push, set } from "firebase/database";
import { db } from "../firebase";

/* ==========================================
                PROVINCES
=======================================

=== */

const provinces = [
  "Gauteng",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Free State",
  "Eastern Cape",
  "Western Cape",
  "KwaZulu-Natal",
  "Northern Cape"
];

/* ==========================================
                COMPONENT
========================================== */

const FreeTrial = () => {

  const [loading, setLoading] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    idNumber: "",
    address: "",
    suburb: "",
    city: "",
    province: "",
    notes: "",
    agree: false
  });

  /* ==========================================
              HANDLE INPUT CHANGE
  ========================================== */

  const handleChange = (
    field: string,
    value: string | boolean
  ) => {

    setForm(prev => ({
      ...prev,
      [field]: value
    }));

  };

  /* ==========================================
              SUBMIT APPLICATION
  ========================================== */

  const submitTrial = async () => {

    if (
      !form.fullName ||

      !form.phone ||
      !form.idNumber ||
      !form.address
    ) {
      alert("Please complete all required fields.");
      return;
    }

    if (!form.agree) {
      alert("Please accept the declaration.");
      return;
    }

    try {

      setLoading(true);

      const applicationRef = push(
        ref(db, "freeTrialApplications")
      );

      await set(applicationRef, {
        ...form,
        status: "Pending",

        createdAt: new Date().toISOString(),
        trialEnds: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ).toISOString()
      });

      setSubmitted(true);

      setForm({
        fullName: "",
        phone: "",
        email: "",
        idNumber: "",
        address: "",
        suburb: "",
        city: "",
        province: "",
        notes: "",
        agree: false
      });

    } catch (error) {

      console.error(error);


      alert("Unable to submit application.");

    } finally {

      setLoading(false);

    }

  };


  /* ==========================================
                  RETURN
  ========================================== */

  return (

    <Box sx={styles.page}>

      {/* ==========================================
                ANIMATED BACKGROUND
      ========================================== */}

      <Box sx={styles.background}>

        <motion.div
          style={styles.circle1}
          animate={{
            x: [0, 30, 0],
            y: [0, -25, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity
          }}
        />

        <motion.div
          style={styles.circle2}

          animate={{
            x: [0, -25, 0],
            y: [0, 35, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity
          }}
        />

        <motion.div
          style={styles.circle3}
          animate={{
            scale: [1, 1.18, 1]
          }}
          transition={{
            duration: 9,
            repeat: Infinity
          }}
        />

      </Box>


      {/* ==========================================
                  APPLICATION FORM
      ========================================== */}

      <motion.div
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}

        transition={{ duration: 1 }}
      >

        <Paper
          sx={{
            p: 5,
            borderRadius: 6,
            background: "rgba(255,255,255,.96)",
            boxShadow: "0 25px 60px rgba(0,0,0,.25)",
            position: "relative",
            zIndex: 2
          }}
        >

          <Typography
            variant="h4"
            fontWeight={800}
            textAlign="center"
            mb={1}
          >
            Start Your FREE 14-Day Fibre Trial
          </Typography>

          <Typography

            textAlign="center"
            color="text.secondary"
            mb={5}
          >
            Complete the application below and one of our
            OpenServe Fibre Consultants will contact you to
            verify coverage and activate your FREE Trial.
          </Typography>

          <Grid container spacing={3}>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name *"
                value={form.fullName}
                onChange={(e) =>
                  handleChange("fullName", e.target.value)
                }
                InputProps={{

                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="primary" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number *"
                value={form.phone}
                onChange={(e) =>
                  handleChange("phone", e.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="primary" />
                    </InputAdornment>
                  )
                }}

              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                value={form.email}
                onChange={(e) =>
                  handleChange("email", e.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="primary" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth

                label="South African ID Number / Passport Number *"
                value={form.idNumber}
                onChange={(e) =>
                  handleChange("idNumber", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Installation Address *"
                value={form.address}
                onChange={(e) =>
                  handleChange("address", e.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Home color="primary" />
                    </InputAdornment>
                  )

                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Suburb"
                value={form.suburb}
                onChange={(e) =>
                  handleChange("suburb", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={form.city}
                onChange={(e) =>
                  handleChange("city", e.target.value)
                }
                InputProps={{

                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn color="primary" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Province"
                value={form.province}
                onChange={(e) =>
                  handleChange("province", e.target.value)
                }
              >
                {provinces.map((province) => (
                  <MenuItem
                    key={province}
                    value={province}

                  >
                    {province}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Additional Notes"
                value={form.notes}
                onChange={(e) =>
                  handleChange("notes", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox

                    checked={form.agree}
                    onChange={(e) =>
                      handleChange(
                        "agree",
                        e.target.checked
                      )
                    }
                  />
                }
                label="I confirm that the information provided is correct and I agree to be contacted regarding my FREE 14-Day OpenServe Fibre Trial."
              />
            </Grid>

            <Grid item xs={12}>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: .98 }}
              >

                <Button

                  fullWidth
                  size="large"
                  variant="contained"
                  disabled={loading || !form.agree}
                  endIcon={<ArrowForward />}
                  onClick={submitTrial}
                  sx={styles.submitButton}
                >
                  {loading
                    ? "Submitting Application..."
                    : "Submit Application"}
                </Button>

              </motion.div>

            </Grid>

          </Grid>

        </Paper>

      </motion.div>

      {/* 

==========================================
              SUCCESS + AFTER SUBMISSION
      ========================================== */}

      {submitted && (

        <>

          <motion.div
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
          >

            <Paper
              sx={{
                mt: 5,
                p: 5,
                borderRadius: 6,
                textAlign: "center",
                color: "#fff",

                background:
                  "linear-gradient(135deg,#0284c7,#2563eb,#4f46e5)",
                boxShadow:
                  "0 25px 60px rgba(37,99,235,.40)"
              }}
            >

              <motion.div
                animate={{
                  scale: [1, 1.12, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >

                <CheckCircle
                  sx={{
                    fontSize: 90,
                    mb: 2,
                    color: "#4ade80"
                  }}

                />

              </motion.div>

              <Typography
                variant="h3"
                fontWeight={900}
                mb={2}
              >
                🎉 Application Submitted Successfully
              </Typography>

              <Typography
                fontSize={20}
                sx={{
                  maxWidth: 850,
                  mx: "auto",
                  lineHeight: 1.9,
                  opacity: .96
                }}
              >
                Thank you for applying for the
                <b> OpenServe FREE 14-Day Fibre Trial.</b>


                <br /><br />

                Your application has been received
                successfully.

                One of our Fibre Consultants will
                contact you shortly to verify
                OpenServe Fibre coverage at your
                address and guide you through the
                activation process.

                <br /><br />

                We look forward to welcoming you
                to the future of high-speed internet.
              </Typography>

            </Paper>

          </motion.div>

          {/* =======================================

===
                  FREE TRIAL BENEFITS
          ========================================== */}

          <Box mt={7}>

            <Typography
              variant="h3"
              fontWeight={900}
              textAlign="center"
              color="#fff"
              mb={5}
            >
              🎁 Your FREE Trial Includes
            </Typography>

            <Grid container spacing={3}>

              {[
                "FREE 14 Days of High-Speed Fibre Internet",
                "FREE Fibre Coverage Verification",

                "FREE Installation Assessment",
                "Unlimited Streaming & Gaming",
                "Ultra-Fast Downloads",
                "Crystal Clear Video Calls",
                "Reliable OpenServe Infrastructure",
                "24/7 Technical Support",
                "No Hidden Costs During Trial",
                "Professional Fibre Consultants",
                "Secure & Stable Connection",
                "Business & Home Ready"
              ].map((item, index) => (

                <Grid
                  item
                  xs={12}
                  md={6}
                  lg={4}
                  key={index}
                >

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 50

                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0
                    }}
                    transition={{
                      duration: .7,
                      delay: index * .05
                    }}
                    whileHover={{
                      scale: 1.04,
                      y: -8
                    }}
                  >

                    <Paper
                      sx={{
                        p: 3,
                        height: "100%",
                        borderRadius: 5,
                        background:
                          "rgba(255,255,255,.10)",
                        backdropFilter: "blur(18px)",
                        color: "#fff",

                        border:
                          "1px solid rgba(255,255,255,.15)"
                      }}
                    >

                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                      >

                        <CheckCircle
                          sx={{
                            color: "#22c55e",
                            fontSize: 34
                          }}
                        />

                        <Typography
                          fontWeight={700}
                          fontSize={18}
                        >
                          {item}
                        </Typography>


                      </Stack>

                    </Paper>

                  </motion.div>

                </Grid>

              ))}

            </Grid>

          </Box>


          {/* ==========================================
                WHY THOUSANDS CHOOSE OUR FIBRE
          ========================================== */}

          <Box mt={10}>

            <Typography
              variant="h3"
              fontWeight={900}
              textAlign="center"
              color="#fff"
              mb={5}
            >
              Why Thousands Choose OpenServe Fibre
            </Typography>

            <Grid container spacing={4}>

              {[
                {
                  icon: <Speed sx={{ fontSize: 60 }} />,
                  title: "Blazing Fast Speeds",
                  desc: "Enjoy ultra-fast downloads, buffer-free streaming, seamless online gaming and crystal-clear video calls."
                },
                {
                  icon: <Wifi sx={{ fontSize: 60 }} />,

                  title: "Reliable Fibre Network",
                  desc: "Built on OpenServe's trusted fibre infrastructure for stable, uninterrupted connectivity."
                },
                {
                  icon: <Security sx={{ fontSize: 60 }} />,
                  title: "Safe & Secure",
                  desc: "Advanced fibre technology provides a secure internet experience for your entire family."
                },
                {
                  icon: <SupportAgent sx={{ fontSize: 60 }} />,
                  title: "Dedicated Support",
                  desc: "Friendly consultants and technical specialists are available whenever you need assistance."
                },
                {
                  icon: <RocketLaunch sx={{ fontSize: 60 }} />,
                  title: "Future Ready",

                  desc: "Designed for smart homes, remote work, online learning and next-generation entertainment."
                },
                {
                  icon: <Verified sx={{ fontSize: 60 }} />,
                  title: "Trusted Nationwide",
                  desc: "Thousands of South Africans rely on OpenServe Fibre every day for dependable internet."
                }
              ].map((item, index) => (

                <Grid item xs={12} md={6} lg={4} key={index}>

                  <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: .8,
                      delay: index * .1
                    }}
                    whileHover={{

                      scale: 1.05,
                      y: -10
                    }}
                  >

                    <Card
                      sx={{
                        height: "100%",
                        borderRadius: 6,
                        background: "rgba(255,255,255,.08)",
                        backdropFilter: "blur(20px)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,.15)"
                      }}
                    >

                      <CardContent sx={{ textAlign: "center", p: 4 }}>

                        <Box
                          sx={{
                            color: "#38bdf8",
                            mb: 3

                          }}
                        >
                          {item.icon}
                        </Box>

                        <Typography
                          fontSize={24}
                          fontWeight={800}
                          mb={2}
                        >
                          {item.title}
                        </Typography>

                        <Typography
                          sx={{
                            color: "#dbeafe",
                            lineHeight: 1.8
                          }}
                        >
                          {item.desc}
                        </Typography>

                      </CardContent>

                    </Card>

                  </motion.div>

                </Grid>

              ))}

            </Grid>

          </Box>

          {/* ==========================================
                    TESTIMONIALS
          ========================================== */}

          <Box mt={10}>

            <Typography
              variant="h3"

              fontWeight={900}
              color="#fff"
              textAlign="center"
              mb={5}
            >
              What Our Customers Say
            </Typography>

            <Grid container spacing={4}>

              {[
                {
                  name: "Sarah M.",
                  city: "Johannesburg",
                  comment:
                    "The installation process was quick and the fibre speed is unbelievable. Streaming has never been this smooth."
                },
                {
                  name: "David K.",
                  city: "Pretoria",
                  comment:
                    "Excellent customer service, professional consultants and very reliable internet connection."
                },
                {
                  name: "Lerato P.",
                  city: "Polokwane",
                  comment:
                    "The FREE Trial convinced me immediately. Fast internet with absolutely no buffering."
                }
              ].map((item, index) => (

                <Grid item xs={12} md={4} key={index}>

                  <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: .8,
                      delay: index * .2
                    }}
                    whileHover={{
                      scale: 1.04

                    }}
                  >

                    <Card
                      sx={{
                        borderRadius: 6,
                        height: "100%",
                        background: "rgba(255,255,255,.08)",
                        backdropFilter: "blur(20px)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,.15)"
                      }}
                    >

                      <CardContent>

                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            mx: "auto",
                            mb: 2,
                            bgcolor: "#2563eb"

                          }}
                        >
                          <Person />
                        </Avatar>

                        <Box
                          display="flex"
                          justifyContent="center"
                          mb={2}
                        >
                          <Star color="warning" />
                          <Star color="warning" />
                          <Star color="warning" />
                          <Star color="warning" />
                          <Star color="warning" />
                        </Box>

                        <Typography
                          textAlign="center"
                          color="#dbeafe"
                          lineHeight={1.8}
                        >
                          "{item.comment}"
                        </Typography>


                        <Typography
                          mt={3}
                          fontWeight={800}
                          textAlign="center"
                        >
                          {item.name}
                        </Typography>

                        <Typography
                          textAlign="center"
                          color="#93c5fd"
                        >
                          {item.city}
                        </Typography>

                      </CardContent>

                    </Card>

                  </motion.div>

                </Grid>

              ))}

            </Grid>

          </Box>

          {/* ==========================================
                          FAQ
          ========================================== */}

          <Box mt={10}>

            <Typography
              variant="h3"
              fontWeight={900}
              textAlign="center"
              color="#fff"
              mb={5}
            >
              Frequently Asked Questions

            </Typography>

            <Grid container spacing={3}>

              {[
                {
                  q: "How long is the FREE Trial?",
                  a: "Your FREE Trial runs for 14 consecutive days after successful activation."
                },
                {
                  q: "Do I pay anything during the trial?",
                  a: "No. The approved FREE Trial has no hidden costs or monthly charges during the trial period."
                },
                {
                  q: "How do I know if Fibre is available?",
                  a: "Our OpenServe Fibre Consultant will verify coverage at your address before activating your FREE Trial."
                },
                {
                  q: "When will someone contact me?",

                  a: "An OpenServe Fibre Consultant will contact you shortly after your application has been received."
                },
                {
                  q: "Can I continue after my FREE Trial?",
                  a: "Yes. If you're happy with the service, we'll assist you in choosing the best Fibre package for your home or business."
                },
                {
                  q: "Can I use the FREE Trial for streaming and gaming?",
                  a: "Absolutely. Enjoy Netflix, YouTube, online gaming, video conferencing and ultra-fast downloads during your trial."
                }
              ].map((faq, index) => (

                <Grid item xs={12} md={6} key={index}>

                  <motion.div
                    initial={{
                      opacity: 0,

                      x: index % 2 === 0 ? -60 : 60
                    }}
                    whileInView={{
                      opacity: 1,
                      x: 0
                    }}
                    transition={{
                      duration: .8
                    }}
                  >

                    <Paper
                      sx={{
                        p: 3,
                        borderRadius: 5,
                        background: "rgba(255,255,255,.08)",
                        backdropFilter: "blur(20px)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,.15)"
                      }}
                    >

                      <Typography

                        fontWeight={800}
                        fontSize={20}
                        mb={2}
                      >
                        {faq.q}
                      </Typography>

                      <Typography
                        color="#dbeafe"
                        lineHeight={1.8}
                      >
                        {faq.a}
                      </Typography>

                    </Paper>

                  </motion.div>

                </Grid>

              ))}

            </Grid>

          </Box>

          {/* ==========================================
                    FINAL CALL TO ACTION
          ========================================== */}

          <motion.div
            animate={{
              y: [0, -12, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity
            }}
          >

            <Box
              sx={{
                mt: 12,
                textAlign: "center"

              }}
            >

              <Typography
                variant="h2"
                fontWeight={900}
                color="#fff"
                mb={2}
              >
                Welcome To The Future Of Fibre
              </Typography>

              <Typography
                sx={{
                  maxWidth: 900,
                  mx: "auto",
                  color: "#dbeafe",
                  fontSize: 22,
                  lineHeight: 1.8,
                  mb: 5
                }}
              >
                Thank you for choosing OpenServe Fibre.

                We're excited to help you experience
                faster streaming, smoother gaming,
                crystal-clear video calls and reliable
                internet connectivity with your FREE
                14-Day Fibre Trial.
              </Typography>

              <Chip
                icon={<RocketLaunch />}
                label="OpenServe Fibre • Fast • Reliable • Secure • 2026"
                sx={{
                  px: 3,
                  py: 3,
                  fontSize: 17,
                  fontWeight: 800,
                  color: "#fff",
                  background:
                    "linear-gradient(90deg,#0284c7,#2563eb,#4f46e5)"
                }}
              />

            </Box>


          </motion.div>

        </>

      )}

      {/* ==========================================
                        FOOTER
      ========================================== */}

      <Box sx={styles.footer}>

        <Typography
          variant="h4"
          fontWeight={900}
          color="#fff"
        >
          OpenServe Fibre
        </Typography>


        <Typography
          mt={2}
          color="#dbeafe"
          fontSize={18}
        >
          FREE 14-Day Fibre Trial Experience
        </Typography>

        <Typography
          mt={1}
          color="#93c5fd"
        >
          Experience blazing-fast Fibre Internet,
          reliable connectivity and professional
          customer service across South Africa.
        </Typography>

        <Typography
          mt={5}
          color="#bfdbfe"
        >
          © 2026 OpenServe Fibre. All Rights Reserved.

        </Typography>

      </Box>

    </Box>

  );

};

export default FreeTrial;

/* ==========================================
                    STYLES
========================================== */

const styles: { [key: string]: CSSProperties } = {

  page: {
    minHeight: "100vh",
    position: "relative",

    overflow: "hidden",
    background:
      "linear-gradient(135deg,#020617 0%,#0f172a 25%,#1d4ed8 60%,#2563eb 100%)",
    padding: "60px 25px 100px"
  },

  background: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    zIndex: 0
  },

  circle1: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "rgba(59,130,246,.18)",
    top: -180,
    left: -180,
    filter: "blur(100px)"
  },


  circle2: {
    position: "absolute",
    width: 430,
    height: 430,
    borderRadius: "50%",
    background: "rgba(14,165,233,.16)",
    right: -150,
    top: 120,
    filter: "blur(90px)"
  },

  circle3: {
    position: "absolute",
    width: 650,
    height: 650,
    borderRadius: "50%",
    background: "rgba(99,102,241,.14)",
    bottom: -260,
    left: "35%",
    transform: "translateX(-50%)",
    filter: "blur(130px)"
  },

  submitButton: {
    height: 65,
    borderRadius: 18,
    fontSize: 20,
    fontWeight: 800,
    textTransform: "none",
    background:
      "linear-gradient(90deg,#0284c7,#2563eb,#4f46e5)",
    boxShadow:
      "0 18px 40px rgba(37,99,235,.45)"
  },

  footer: {
    marginTop: "100px",
    paddingTop: "40px",
    textAlign: "center",
    borderTop: "1px solid rgba(255,255,255,.15)"
  }

};
