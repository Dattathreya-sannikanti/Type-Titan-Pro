import React, { useContext, useEffect, useRef, useState } from 'react';
import { GameContext } from '../contexts/GameContext';
import { TOTAL_LEVELS, GAME_CONFIG } from '../constants/textData';

export default function CampaignMap({ setScreen, setPreviewLevel }) {
    const { currentMode, activeProfile } = useContext(GameContext);
    const mapScrollAreaRef = useRef(null);
    const [pathData, setPathData] = useState("");
    const [nodes, setNodes] = useState([]);
    const [containerHeight, setContainerHeight] = useState(0);

    useEffect(() => {
        const renderMap = () => {
            if (!mapScrollAreaRef.current) return;
            const containerWidth = mapScrollAreaRef.current.offsetWidth || 300;
            const playerStats = activeProfile.progress[currentMode];
            const maxSubLevels = GAME_CONFIG[currentMode]?.subLevels || 1;

            const startYPosition = 1000;
            const stepYDistance = 100;
            setContainerHeight(startYPosition + 150);

            let drawnPathData = "";
            let previousX = 0, previousY = 0;
            const newNodes = [];

            for (let i = 0; i < TOTAL_LEVELS; i++) {
                const isEvenRow = (i % 2 === 0);
                const actualXPosition = containerWidth * (isEvenRow ? 0.25 : 0.75);
                const actualYPosition = startYPosition - (i * stepYDistance);

                let statusClassString = "locked";
                let nodeHtmlContent = i + 1;

                if (i < playerStats.level) {
                    statusClassString = "completed";
                    nodeHtmlContent = "✓";
                } else if (i === playerStats.level) {
                    statusClassString = "active";
                    nodeHtmlContent = `${i + 1} <span class='text-[10px] block'>${playerStats.sub}/${maxSubLevels}</span>`;
                }

                const nodeData = {
                    id: i,
                    status: statusClassString,
                    content: nodeHtmlContent,
                    x: actualXPosition,
                    y: actualYPosition,
                    dots: []
                };

                if (statusClassString !== 'locked') {
                    let filledDotsCount = (statusClassString === 'completed') ? maxSubLevels : playerStats.sub;
                    for (let s = 0; s < maxSubLevels; s++) {
                        nodeData.dots.push(s < filledDotsCount);
                    }
                }

                newNodes.push(nodeData);

                if (i === 0) {
                    drawnPathData += `M ${actualXPosition} ${actualYPosition}`;
                } else {
                    drawnPathData += ` Q ${previousX} ${(previousY + actualYPosition) / 2}, ${actualXPosition} ${actualYPosition}`;
                }

                previousX = actualXPosition;
                previousY = actualYPosition;
            }

            setPathData(drawnPathData);
            setNodes(newNodes);
        };

        renderMap();
        window.addEventListener('resize', renderMap);
        return () => window.removeEventListener('resize', renderMap);
    }, [currentMode, activeProfile]);

    const handleNodeClick = (nodeId) => {
        const playerStats = activeProfile.progress[currentMode];
        const maxSubLevels = GAME_CONFIG[currentMode].subLevels;
        let subLevelToStartAt = (nodeId === playerStats.level) ? playerStats.sub : 0;
        setPreviewLevel({
            level: nodeId,
            sub: subLevelToStartAt,
            maxSub: maxSubLevels
        });
    };

    return (
        <section className="flex-grow flex-col h-screen flex overflow-hidden z-10 w-full">
            <div className="p-4 glass-card m-4 flex justify-between items-center z-50">
                <button 
                    onClick={() => setScreen('dashboard')} 
                    className="text-sm hover:text-black hover:bg-white text-white font-bold border border-white px-4 py-2 rounded transition"
                >
                    ← DASHBOARD
                </button>
                <h2 className="text-xl font-bold tracking-widest uppercase">{currentMode} CAMPAIGN MAP</h2>
                <div className="w-24"></div>
            </div>

            <div className="flex-grow overflow-y-auto p-10 relative">
                <div id="map-scroll-area" ref={mapScrollAreaRef} style={{ height: containerHeight }}>
                    <svg className="thread-line-svg">
                        <path className="thread-path" d={pathData} />
                    </svg>
                    
                    <div id="map-nodes-container">
                        {nodes.map(node => (
                            <div 
                                key={`node-content-${node.id}`}
                                className={`level-circle ${node.status}`}
                                style={{ left: node.x - 35, top: node.y - 35 }}
                                onClick={() => node.status !== 'locked' && handleNodeClick(node.id)}
                            >
                                {node.status === 'completed' ? '✓' : (
                                    <>
                                        {node.id + 1}
                                        {node.status === 'active' && <span className="text-[10px] block">{activeProfile.progress[currentMode].sub}/{GAME_CONFIG[currentMode]?.subLevels}</span>}
                                    </>
                                )}
                                {node.status !== 'locked' && (
                                    <div className="sub-dots mt-1">
                                        {node.dots.map((isFilled, idx) => (
                                            <div key={idx} className={`dot ${isFilled ? 'filled' : ''}`}></div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
