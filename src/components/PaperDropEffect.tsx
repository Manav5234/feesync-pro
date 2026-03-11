import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, File, Receipt, ClipboardList } from "lucide-react";

interface Paper {
  id: number;
  x: number;
  delay: number;
  duration: number;
  rotation: number;
  rotateX: number;
  rotateY: number;
  size: number;
  opacity: number;
  icon: number;
}

const icons = [FileText, File, Receipt, ClipboardList];

export function PaperDropEffect() {
  const [papers, setPapers] = useState<Paper[]>([]);

  useEffect(() => {
    const generated: Paper[] = Array.from({ length: 22 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 12,
      duration: 14 + Math.random() * 16,
      rotation: -50 + Math.random() * 100,
      rotateX: -30 + Math.random() * 60,
      rotateY: -40 + Math.random() * 80,
      size: 32 + Math.random() * 44,
      opacity: 0.12 + Math.random() * 0.22,
      icon: Math.floor(Math.random() * icons.length),
    }));
    setPapers(generated);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" style={{ perspective: "1200px" }}>
      {papers.map((p) => {
        const Icon = icons[p.icon];
        return (
          <motion.div
            key={p.id}
            className="absolute"
            style={{
              left: `${p.x}%`,
              transformStyle: "preserve-3d",
            }}
            initial={{
              y: "-10%",
              rotateZ: p.rotation,
              rotateX: p.rotateX,
              rotateY: p.rotateY,
              opacity: 0,
            }}
            animate={{
              y: "110vh",
              rotateZ: [p.rotation, p.rotation + 45, p.rotation - 30, p.rotation + 60],
              rotateX: [p.rotateX, p.rotateX + 25, p.rotateX - 15, p.rotateX + 20],
              rotateY: [p.rotateY, p.rotateY - 40, p.rotateY + 30, p.rotateY - 20],
              x: [0, 40, -30, 20, 0],
              opacity: [0, p.opacity, p.opacity, p.opacity, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div
              className="relative"
              style={{
                transformStyle: "preserve-3d",
                filter: `drop-shadow(0 6px 20px hsl(var(--primary) / 0.25))`,
              }}
            >
              {/* Front face */}
              <div
                className="text-primary/50 bg-primary/[0.04] rounded-lg p-1.5"
                style={{
                  backfaceVisibility: "hidden",
                  boxShadow: "inset 0 0 12px hsl(var(--primary) / 0.08)",
                }}
              >
                <Icon style={{ width: p.size, height: p.size }} strokeWidth={1.4} />
              </div>
              {/* Back face */}
              <div
                className="absolute inset-0 text-primary/30 bg-primary/[0.03] rounded-lg p-1.5"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  boxShadow: "inset 0 0 12px hsl(var(--primary) / 0.06)",
                }}
              >
                <Icon style={{ width: p.size, height: p.size }} strokeWidth={1} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
