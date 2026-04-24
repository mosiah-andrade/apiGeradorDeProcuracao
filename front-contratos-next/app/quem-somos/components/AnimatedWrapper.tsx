"use client";

import { motion, HTMLMotionProps } from 'framer-motion';

interface AnimatedBadgeProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

// ⚠️ ATENÇÃO AQUI: Você precisa receber o "...rest" e repassar para a motion.div
export default function AnimatedBadge({ children, ...rest }: AnimatedBadgeProps) {
  return (
    // O {...rest} é o que faz o className do Tailwind chegar no HTML final!
    <motion.div {...rest}>
      {children}
    </motion.div>
  );
}