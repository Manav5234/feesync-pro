import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

interface Paper {
  id: number;
  x: number;
  delay: number;
  duration: number;
  rotation: number;
  size: number;
  opacity: number;
}

export function PaperDropEffect() {
  const [papers, setPapers] = useState<Paper[]>([]);

  useEffect(() => {
    const generated: Paper[] = Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 10 + Math.random() * 10,
      rotation: -30 + Math.random() * 60,
      size: 16 + Math.random() * 24,
      opacity: 0.06 + Math.random() * 0.1,
    }));
    setPapers(generated);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      <div className="absolute inset-0 backdrop-blur-[1px]" />
      {papers.map((p) => (
        <motion.div
          key={p.id}
          className="absolute text-primary/30"
          style={{ left: `${p.x}%`, opacity: p.opacity }}
          initial={{ y: "-10%", rotate: p.rotation }}
          animate={{
            y: "110vh",
            rotate: p.rotation + (Math.random() > 0.5 ? 180 : -180),
            x: [0, 30, -20, 10, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <FileText style={{ width: p.size, height: p.size }} />
        </motion.div>
      ))}
    </div>
  );
}
