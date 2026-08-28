import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

interface SplitTextProps {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
}

export const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = "",
  wordClassName = "",
  delay = 0.04,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const words = text.split(" ");

  if (shouldReduceMotion) {
    return <span className={className}>{text}</span>;
  }

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delay,
        delayChildren: 0.05,
      },
    },
  };

  const child: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: "easeOut",
      },
    },
  };

  return (
    <span className={`inline-block ${className}`}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden="true"
        className="inline-block"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {words.map((word, i) => (
          <motion.span
            key={`${word}-${i}`}
            variants={child}
            className={`inline-block mr-[0.25em] ${wordClassName}`}
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
    </span>
  );
};
