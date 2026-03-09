import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Search, Bell, ShieldCheck, ArrowRight, FileText, CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const features = [
  {
    icon: Upload,
    title: "Upload Documents",
    description: "Submit fee receipts, scholarship forms, and bonafide requests online — PDF or image.",
  },
  {
    icon: Search,
    title: "Track Status",
    description: "Real-time timeline view of every application from submission to verification.",
  },
  {
    icon: Bell,
    title: "Get Notified",
    description: "Instant notifications when your application status changes — never miss an update.",
  },
  {
    icon: ShieldCheck,
    title: "Admin Verified",
    description: "Verified by authorized admins with AI-powered data extraction for accuracy.",
  },
];

const stats = [
  { value: "10K+", label: "Applications Processed" },
  { value: "98%", label: "Verification Rate" },
  { value: "< 24h", label: "Avg. Response Time" },
  { value: "100%", label: "Paperless" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-info/5" />
        <div className="container relative py-20 md:py-32">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <FileText className="h-4 w-4 text-primary" />
              Paperless Fee Management
            </div>
            <h1 className="font-heading text-4xl font-extrabold tracking-tight md:text-6xl">
              College Fee Management —{" "}
              <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                Paperless, Instant, Verified
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Submit fee receipts and applications online. No more admin office queues.
              Track everything in real-time with AI-powered verification.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="gap-2 px-8 text-base" onClick={() => navigate("/login/student")}>
                Login as Student <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2 px-8 text-base" onClick={() => navigate("/login/admin")}>
                Login as Admin <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* Floating elements */}
          <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-10 h-56 w-56 rounded-full bg-info/10 blur-3xl" />
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-card">
        <div className="container grid grid-cols-2 gap-6 py-12 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
            >
              <div className="font-heading text-3xl font-bold text-primary">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28">
        <div className="container">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading text-3xl font-bold md:text-4xl">
              Everything You Need
            </h2>
            <p className="mt-3 text-muted-foreground">
              A complete digital solution for fee receipt management and verification.
            </p>
          </motion.div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
              >
                <Card className="group h-full transition-shadow hover:shadow-lg">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-card py-20">
        <div className="container">
          <motion.h2
            className="text-center font-heading text-3xl font-bold md:text-4xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              { step: "01", icon: Upload, title: "Submit Application", desc: "Upload your fee receipt and fill in the required details." },
              { step: "02", icon: Clock, title: "Under Review", desc: "Admin reviews your documents with AI-assisted data extraction." },
              { step: "03", icon: CheckCircle2, title: "Get Verified", desc: "Receive instant notification once your application is verified." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="relative text-center"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Step {item.step}</div>
                <h3 className="font-heading text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <motion.div
            className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-r from-primary to-info p-10 text-center text-primary-foreground md:p-14"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading text-2xl font-bold md:text-3xl">Ready to Go Paperless?</h2>
            <p className="mt-3 opacity-90">Join your college's digital fee management system today.</p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 px-8"
                onClick={() => navigate("/login/student")}
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
