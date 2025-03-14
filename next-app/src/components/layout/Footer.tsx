'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Github, Twitter, Mail } from 'lucide-react';

const Footer = () => (
  <motion.footer
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: 0.8 }}
    viewport={{ once: true }}
    className="bg-background border-t text-foreground py-8 md:py-12"
  >
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* About Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">About Fortoon</h3>
          <p className="text-muted-foreground text-sm">
            A platform for manga enthusiasts to discover and read their favorite stories.
            For educational purposes only.
          </p>
        </div>

        {/* Contact/Social */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Connect With Us</h3>
          <div className="flex space-x-4">
            <a
              href="https://github.com/Yayawak"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-6 h-6" />
            </a>
            <a
              href="https://github.com/jaikwangg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
        <p>© 2024 Fortoon. For educational purposes only.</p>
      </div>
    </div>
  </motion.footer>
);

export default Footer; 