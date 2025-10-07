'use client';

import { Geist, Geist_Mono } from "next/font/google";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./globals.css";
import Modal from "./modal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [droppedItems, setDroppedItems] = useState<Array<{id: string, type: string, x: number, y: number, name?: string}>>([]);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isBrewing, setIsBrewing] = useState(false);
  const [brewedItemName, setBrewedItemName] = useState<string | null>(null);

  const generateBrewedName = async () => {
    try {
      const response = await fetch('https://ai.hackclub.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'moonshotai/kimi-k2-instruct-0905',
          messages: [
            {
              role: 'user',
              content: 'You are a magical potion naming expert. Create a truly creative, unique name for a potion made by combining pumpkin and candy. Keep it short (1-3 words) and make it Halloween-themed. NEVER include words like: spell, brew, potion, elixir, fog, pumpkin, candy, or any brewing-related terms. Make it imaginative and original, not just combining the ingredient names. Examples: Midnight Delight, Spooky Sweet, Gourd Magic. Return only the name, nothing else.'
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        let name = data.choices?.[0]?.message?.content?.trim();
        if (name) {
          setBrewedItemName('Potion');
        }
      }
    } catch (error) {
      setBrewedItemName('Mystic Brew');
    }
  };

  useEffect(() => {
    const pumpkinItems = droppedItems.filter(item => item.type === 'pumpkin');
    const candyItems = droppedItems.filter(item => item.type === 'candy');

    for (const pumpkin of pumpkinItems) {
      for (const candy of candyItems) {
        const distance = Math.sqrt(
          Math.pow(pumpkin.x - candy.x, 2) + Math.pow(pumpkin.y - candy.y, 2)
        );

        if (distance < 96) {
          console.log('🔮 Combining pumpkin and candy...');
          setIsBrewing(true);
          generateBrewedName();
          setTimeout(() => {
            if (brewedItemName) {
              const mainRect = document.querySelector('main')?.getBoundingClientRect();
              const centerX = mainRect ? mainRect.width / 2 - 48 : 200;
              const centerY = mainRect ? mainRect.height / 2 - 48 : 200;
              const newPotion = {
                id: `potion-${Date.now()}`,
                type: 'potion',
                x: centerX,
                y: centerY,
                name: brewedItemName
              };
              setDroppedItems(prev => [...prev.filter(item =>
                item.id !== pumpkin.id && item.id !== candy.id
              ), newPotion]);
            } else {
              setDroppedItems(prev => prev.filter(item =>
                item.id !== pumpkin.id && item.id !== candy.id
              ));
            }
            setIsBrewing(false);
            setBrewedItemName(null);
          }, 4000);

          return;
        }
      }
    }
  }, [droppedItems]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain');
    if (type) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newItem = {
        id: `${type}-${Date.now()}`,
        type,
        x,
        y
      };
      setDroppedItems(prev => [...prev, newItem]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleItemDragStart = (e: React.DragEvent, itemId: string) => {
    const item = droppedItems.find(item => item.id === itemId);
    if (item) {
      const rect = e.currentTarget.getBoundingClientRect();
      const size = 48;
      const offsetX = e.clientX - rect.left - size;
      const offsetY = e.clientY - rect.top - size;
      setDraggedItemId(itemId);
      setDragOffset({ x: offsetX, y: offsetY });
    }
  };

  const handleItemDragEnd = (e: React.DragEvent) => {
    if (draggedItemId) {
      const mainRect = document.querySelector('main')?.getBoundingClientRect();
      if (mainRect) {
        const newX = e.clientX - mainRect.left - dragOffset.x;
        const newY = e.clientY - mainRect.top - dragOffset.y;

        setDroppedItems(prev => prev.map(item =>
          item.id === draggedItemId
            ? {
                ...item,
                x: Math.max(0, Math.min(newX, mainRect.width - 96)),
                y: Math.max(0, Math.min(newY, mainRect.height - 96))
              }
            : item
        ));
      }
      setDraggedItemId(null);
      setDragOffset({ x: 0, y: 0 });
    }
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen">
          <main
            className="flex-1 relative"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {children}
            {droppedItems.map((item) => (
              item.type === 'potion' ? (
                <div
                  key={item.id}
                  draggable
                  className="absolute w-24 h-24 bg-purple-600 rounded cursor-move hover:bg-purple-700 transition-colors shadow-lg border-2 border-purple-400"
                  style={{
                    left: item.x,
                    top: item.y,
                  }}
                  onDragStart={(e) => handleItemDragStart(e, item.id)}
                  onDragEnd={handleItemDragEnd}
                />
              ) : (
                <img
                  key={item.id}
                  src={`/${item.type}.png`}
                  alt={item.type}
                  draggable
                  className="absolute w-24 h-24 cursor-move hover:scale-110 transition-transform"
                  style={{
                    left: item.x,
                    top: item.y,
                  }}
                  onDragStart={(e) => handleItemDragStart(e, item.id)}
                  onDragEnd={handleItemDragEnd}
                />
              )
            ))}
            {isBrewing && (
              <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 pointer-events-none">
                <div className="flex flex-col items-center">
                  <motion.div
                    className="relative"
                    animate={{
                      rotate: [-5, 5, -5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                  <img src="/cauldron.png" alt="cauldron" className="w-72 h-72 object-contain" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {[...Array(16)].map((_, i) => {
                      const angle = (i / 16) * Math.PI * 2;
                      const delay = Math.random() * 0.8;
                      const duration = 2 + Math.random() * 1;

                      return (
                        <motion.div
                          key={i}
                          className="absolute rounded-full"
                          style={{
                            width: 15 + Math.random() * 20,
                            height: 15 + Math.random() * 20,
                            backgroundColor: `rgba(156, 163, 175, ${0.4 + Math.random() * 0.3})`,
                            left: '50%',
                            top: '50%',
                          }}
                          initial={{
                            x: Math.cos(angle) * 20,
                            y: 0,
                            scale: 0.3,
                            opacity: 0.7,
                          }}
                          animate={{
                            x: Math.cos(angle) * 40,
                            y: -120 - Math.random() * 60,
                            scale: 1,
                            opacity: 0,
                          }}
                          transition={{
                            duration,
                            delay,
                            ease: [0.25, 0.1, 0.25, 1],
                          }}
                        />
                      );
                    })}
                  </div>
                </motion.div>
                </div>
              </div>
            )}
          </main>
          {!isModalOpen && (
            <aside className="w-80 bg-black border-l border-orange-500">
              <div className="p-4 border-b border-orange-500">
                <h1 className="text-orange-400 font-semibold text-lg">InfiniteBrew</h1>
              </div>
              <div className="p-4 flex gap-3">
                <div
                  draggable
                  className="w-24 h-24 bg-orange-600 rounded cursor-move hover:bg-orange-700 transition-colors shadow-lg border-2 border-orange-400"
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', 'pumpkin')}
                >
                  <img src="/pumpkin.png" alt="Pumpkin" className="w-full h-full object-contain rounded" />
                </div>
                <div
                  draggable
                  className="w-24 h-24 bg-purple-600 rounded cursor-move hover:bg-purple-700 transition-colors shadow-lg border-2 border-purple-400"
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', 'candy')}
                >
                  <img src="/candy.png" alt="Candy" className="w-full h-full object-contain rounded" />
                </div>
              </div>
            </aside>
          )}
        </div>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </body>
    </html>
  );
}
