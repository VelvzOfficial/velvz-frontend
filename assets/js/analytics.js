/**
 * Analytics Page JavaScript
 * Gestiona las gráficas y datos de la página de analytics
 */

(function() {
    'use strict';

    // Configuración de colores
    const COLORS = {
        primary: '#6366f1',
        primaryLight: 'rgba(99, 102, 241, 0.1)',
        secondary: '#e2e8f0',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6'
    };

    // Datos de ejemplo (en producción vendrían del API)
    const analyticsData = {
        conversations: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            current: [120, 145, 132, 168, 185, 98, 76],
            previous: [98, 112, 125, 140, 155, 85, 65]
        },
        satisfaction: {
            labels: ['5 estrellas', '4 estrellas', '3 estrellas', '2 estrellas', '1 estrella'],
            data: [45, 32, 15, 5, 3]
        },
        chatbotPerformance: {
            labels: ['Soporte Técnico', 'Ventas Online', 'FAQ Assistant'],
            conversations: [1234, 987, 626],
            resolution: [96, 92, 89]
        },
        peakHours: {
            labels: ['00h', '02h', '04h', '06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'],
            data: [12, 8, 5, 10, 45, 120, 145, 98, 110, 135, 85, 35]
        }
    };

    // Inicialización
    document.addEventListener('DOMContentLoaded', function() {
        initCharts();
        initPeriodSelector();
    });

    /**
     * Inicializa todas las gráficas
     */
    function initCharts() {
        initConversationsChart();
        initSatisfactionChart();
        initChatbotPerformanceChart();
        initPeakHoursChart();
    }

    /**
     * Gráfica de conversaciones por día
     */
    function initConversationsChart() {
        const ctx = document.getElementById('conversationsChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: analyticsData.conversations.labels,
                datasets: [
                    {
                        label: 'Este período',
                        data: analyticsData.conversations.current,
                        borderColor: COLORS.primary,
                        backgroundColor: COLORS.primaryLight,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: COLORS.primary,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Período anterior',
                        data: analyticsData.conversations.previous,
                        borderColor: COLORS.secondary,
                        backgroundColor: 'transparent',
                        borderDash: [5, 5],
                        tension: 0.4,
                        pointBackgroundColor: COLORS.secondary,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 3,
                        pointHoverRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1a1a2e',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: true
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#64748b',
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#64748b',
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Gráfica de distribución de satisfacción
     */
    function initSatisfactionChart() {
        const ctx = document.getElementById('satisfactionChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: analyticsData.satisfaction.labels,
                datasets: [{
                    data: analyticsData.satisfaction.data,
                    backgroundColor: [
                        COLORS.success,
                        '#34d399',
                        COLORS.warning,
                        '#fb923c',
                        COLORS.danger
                    ],
                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#64748b',
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1a1a2e',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Gráfica de rendimiento por chatbot
     */
    function initChatbotPerformanceChart() {
        const ctx = document.getElementById('chatbotPerformanceChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: analyticsData.chatbotPerformance.labels,
                datasets: [{
                    label: 'Conversaciones',
                    data: analyticsData.chatbotPerformance.conversations,
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(17, 153, 142, 0.8)',
                        'rgba(240, 147, 251, 0.8)'
                    ],
                    borderRadius: 8,
                    barThickness: 40
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1a1a2e',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#64748b',
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#1a1a2e',
                            font: {
                                size: 12,
                                weight: 500
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Gráfica de horas pico
     */
    function initPeakHoursChart() {
        const ctx = document.getElementById('peakHoursChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: analyticsData.peakHours.labels,
                datasets: [{
                    label: 'Conversaciones',
                    data: analyticsData.peakHours.data,
                    backgroundColor: function(context) {
                        const value = context.raw;
                        const max = Math.max(...analyticsData.peakHours.data);
                        const intensity = value / max;
                        return `rgba(99, 102, 241, ${0.3 + intensity * 0.7})`;
                    },
                    borderRadius: 4,
                    barThickness: 16
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1a1a2e',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return context.raw + ' conversaciones';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#64748b',
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#64748b',
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Inicializa el selector de período
     */
    function initPeriodSelector() {
        const periodBtns = document.querySelectorAll('.velvz-period-btn');

        periodBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remover clase activa de todos
                periodBtns.forEach(b => b.classList.remove('velvz-period-btn--active'));

                // Añadir clase activa al clickeado
                this.classList.add('velvz-period-btn--active');

                // Obtener período seleccionado
                const period = this.dataset.period;

                // En producción, aquí se cargarían nuevos datos del API
                console.log('Período seleccionado:', period);

                // Simular actualización de datos
                updateDataForPeriod(period);
            });
        });
    }

    /**
     * Actualiza los datos según el período seleccionado
     * En producción, esto haría una llamada al API
     */
    function updateDataForPeriod(period) {
        // Simulación de actualización
        const periodMultipliers = {
            '7d': 1,
            '30d': 4.3,
            '90d': 13,
            '1y': 52
        };

        const multiplier = periodMultipliers[period] || 1;

        // Actualizar métricas (simulado)
        const totalConv = document.getElementById('totalConversations');
        if (totalConv) {
            const baseValue = 2847;
            const newValue = Math.round(baseValue * multiplier);
            animateValue(totalConv, parseInt(totalConv.textContent.replace(/,/g, '')), newValue, 500);
        }

        // En producción, aquí se actualizarían las gráficas con nuevos datos
    }

    /**
     * Anima un valor numérico
     */
    function animateValue(element, start, end, duration) {
        const range = end - start;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.round(start + range * easeOutQuart);

            element.textContent = current.toLocaleString('es-ES');

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    /**
     * Función para exportar datos a CSV (placeholder)
     */
    window.exportAnalyticsCSV = function() {
        console.log('Exportando datos a CSV...');
        // En producción, esto generaría y descargaría un archivo CSV
        alert('Funcionalidad de exportación próximamente disponible');
    };

    // Añadir listener al botón de exportar
    document.addEventListener('DOMContentLoaded', function() {
        const exportBtn = document.querySelector('.velvz-analytics-table__export');
        if (exportBtn) {
            exportBtn.addEventListener('click', window.exportAnalyticsCSV);
        }
    });

})();
