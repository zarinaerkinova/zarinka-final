import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const ScrollAnimation = ({ children, effect = 'fade-in' }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const variants = {
    'fade-in': {
      visible: { opacity: 1, transition: { duration: 0.5 } },
      hidden: { opacity: 0 },
    },
    'slide-in-left': {
      visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
      hidden: { opacity: 0, x: -100 },
    },
    'slide-in-right': {
      visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
      hidden: { opacity: 0, x: 100 },
    },
  };

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={variants[effect]}
    >
      {children}
    </motion.div>
  );
};

export default ScrollAnimation;
