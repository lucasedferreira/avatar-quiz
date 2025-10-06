export const BLOCO_QUESTOES = [
    {
        id: 1,
        title: 'Bloco 1 — Interesses',
        description: 'Vamos descobrir o que te motiva!',
        questions: [
            {
                id: '1.1',
                text: 'O que você prefere fazer no tempo livre?',
                alternatives: [
                    {
                        id: 'a',
                        text: 'Mexer em computadores/programar pequenos projetos',
                        weights: { PCP: 0, DS: 4, MA: -1 }
                    },
                    {
                        id: 'b',
                        text: 'Organizar atividades, planejar passos para algo',
                        weights: { PCP: 4, DS: 1, MA: 0 }
                    },
                    {
                        id: 'c',
                        text: 'Consertar equipamentos ou montar coisas com ferramentas',
                        weights: { PCP: 0, DS: -1, MA: 4 }
                    },
                    {
                        id: 'd',
                        text: 'Seguir passo a passo para criar algo (receita, montagem)',
                        weights: { PCP: 1, DS: 1, MA: 1 }
                    }
                ]
            },
            {
                id: '1.2',
                text: 'O que te deixa mais satisfeito?',
                alternatives: [
                    {
                        id: 'a',
                        text: 'Ver plano bem executado e no prazo',
                        weights: { PCP: 4, DS: 0, MA: 0 }
                    },
                    {
                        id: 'b',
                        text: 'Resolver um problema lógico/bug',
                        weights: { PCP: 0, DS: 4, MA: -1 }
                    },
                    {
                        id: 'c',
                        text: 'Recuperar algo quebrado e fazê-lo funcionar',
                        weights: { PCP: 0, DS: 0, MA: 4 }
                    },
                    {
                        id: 'd',
                        text: 'Organizar o espaço ou processos de trabalho',
                        weights: { PCP: 3, DS: 0, MA: 1 }
                    }
                ]
            },
            {
                id: '1.3',
                text: 'Qual atividade te chama mais atenção na escola?',
                alternatives: [
                    {
                        id: 'a',
                        text: 'Matemática e raciocínio lógico',
                        weights: { PCP: 1, DS: 4, MA: 0 }
                    },
                    {
                        id: 'b',
                        text: 'Projetos práticos e oficina',
                        weights: { PCP: 0, DS: 0, MA: 4 }
                    },
                    {
                        id: 'c',
                        text: 'Trabalhos em que precise planejar etapas',
                        weights: { PCP: 4, DS: 1, MA: 0 }
                    },
                    {
                        id: 'd',
                        text: 'Pesquisar e aprender novas ferramentas digitais',
                        weights: { PCP: 0, DS: 3, MA: 0 }
                    }
                ]
            },
            {
                id: '1.4',
                text: 'Você prefere tarefas que sejam:',
                alternatives: [
                    {
                        id: 'a',
                        text: 'Repetitivas e organizadas (rotina)',
                        weights: { PCP: 4, DS: 0, MA: 1 }
                    },
                    {
                        id: 'b',
                        text: 'Desafiadoras e variáveis (resolver bugs)',
                        weights: { PCP: 0, DS: 4, MA: 0 }
                    },
                    {
                        id: 'c',
                        text: 'Práticas e manuais (consertos)',
                        weights: { PCP: 0, DS: -1, MA: 4 }
                    },
                    {
                        id: 'd',
                        text: 'Intermediárias (mistura de prática e planejamento)',
                        weights: { PCP: 2, DS: 1, MA: 2 }
                    }
                ]
            }
        ]
    },
    {
        id: 2,
        title: 'Bloco 2 — Estilo de trabalho',
        description: 'Como você atua em diferentes situações?',
        questions: [
            {
                id: '2.1',
                text: 'Em equipe você costuma:',
                alternatives: [
                    {
                        id: 'a',
                        text: 'Organizar as tarefas e prazos',
                        weights: { PCP: 4, DS: 1, MA: 0 }
                    },
                    {
                        id: 'b',
                        text: 'Resolver problemas técnicos',
                        weights: { PCP: 0, DS: 4, MA: 0 }
                    },
                    {
                        id: 'c',
                        text: 'Fazer parte da execução prática',
                        weights: { PCP: 1, DS: 0, MA: 4 }
                    },
                    {
                        id: 'd',
                        text: 'Ajudar com documentação e registro',
                        weights: { PCP: 3, DS: 1, MA: 0 }
                    }
                ]
            },
            {
                id: '2.2',
                text: 'Quando algo quebra, você prefere:',
                alternatives: [
                    {
                        id: 'a',
                        text: 'Planejar a substituição/peças antes de agir',
                        weights: { PCP: 3, DS: 0, MA: 2 }
                    },
                    {
                        id: 'b',
                        text: 'Investigar na prática e consertar imediatamente',
                        weights: { PCP: 0, DS: -1, MA: 4 }
                    },
                    {
                        id: 'c',
                        text: 'Escrever um plano para evitar que quebre de novo',
                        weights: { PCP: 4, DS: 0, MA: 0 }
                    },
                    {
                        id: 'd',
                        text: 'Desenvolver uma ferramenta/software que ajude no conserto',
                        weights: { PCP: 0, DS: 4, MA: 1 }
                    }
                ]
            },
            {
                id: '2.3',
                text: 'Você prefere aprender através de:',
                alternatives: [
                    {
                        id: 'a',
                        text: 'Aulas teóricas e planejamento',
                        weights: { PCP: 3, DS: 1, MA: 0 }
                    },
                    {
                        id: 'b',
                        text: 'Projetos práticos na oficina',
                        weights: { PCP: 0, DS: 0, MA: 4 }
                    },
                    {
                        id: 'c',
                        text: 'Tutoriais e prática em computador',
                        weights: { PCP: 0, DS: 4, MA: 0 }
                    },
                    {
                        id: 'd',
                        text: 'Mistura equilibrada de teoria e prática',
                        weights: { PCP: 2, DS: 1, MA: 2 }
                    }
                ]
            },
            {
                id: '2.4',
                text: 'Qual frase combina mais com você?',
                alternatives: [
                    {
                        id: 'a',
                        text: 'Gosto de que tudo esteja bem programado',
                        weights: { PCP: 4, DS: 1, MA: 0 }
                    },
                    {
                        id: 'b',
                        text: 'Gosto de montar/ajustar coisas com as mãos',
                        weights: { PCP: 0, DS: 0, MA: 4 }
                    },
                    {
                        id: 'c',
                        text: 'Gosto de criar soluções com código',
                        weights: { PCP: 0, DS: 4, MA: 0 }
                    },
                    {
                        id: 'd',
                        text: 'Gosto de entender o todo e os detalhes',
                        weights: { PCP: 2, DS: 2, MA: 2 }
                    }
                ]
            }
        ]
    },
    {
        id: 3,
        title: 'Bloco 3 — Preferências de aprendizado',
        description: 'Onde você se vê aprendendo melhor?',
        questions: [
            {
                id: '3.1',
                text: 'Você se sente mais confortável em:',
                alternatives: [
                    {
                        id: 'a',
                        text: 'Ambiente organizado com rotinas definidas',
                        weights: { PCP: 4, DS: 0, MA: 1 }
                    },
                    {
                        id: 'b',
                        text: 'Oficina/ambiente com ferramentas e peças',
                        weights: { PCP: 0, DS: -1, MA: 4 }
                    },
                    {
                        id: 'c',
                        text: 'Sala com computadores e acesso a internet',
                        weights: { PCP: 0, DS: 4, MA: 0 }
                    },
                    {
                        id: 'd',
                        text: 'Ambiente híbrido (laboratório + teoria)',
                        weights: { PCP: 2, DS: 2, MA: 2 }
                    }
                ]
            },
            {
                id: '3.2',
                text: 'Ao enfrentar um problema, você prefere:',
                alternatives: [
                    {
                        id: 'a',
                        text: 'Mapear as etapas para resolver antes de começar',
                        weights: { PCP: 4, DS: 1, MA: 0 }
                    },
                    {
                        id: 'b',
                        text: 'Testar hipóteses até achar solução',
                        weights: { PCP: 0, DS: 4, MA: 0 }
                    },
                    {
                        id: 'c',
                        text: 'Tocar com as mãos e ajustar fisicamente',
                        weights: { PCP: 0, DS: 0, MA: 4 }
                    },
                    {
                        id: 'd',
                        text: 'Pedir ajuda e distribuir tarefas',
                        weights: { PCP: 3, DS: 1, MA: 1 }
                    }
                ]
            },
            {
                id: '3.3',
                text: 'Você se vê no futuro fazendo:',
                alternatives: [
                    {
                        id: 'a',
                        text: 'Coordenando equipes e processos',
                        weights: { PCP: 4, DS: 0, MA: 1 }
                    },
                    {
                        id: 'b',
                        text: 'Desenvolvendo softwares e apps',
                        weights: { PCP: 0, DS: 4, MA: 0 }
                    },
                    {
                        id: 'c',
                        text: 'Trabalhando em manutenção de veículos/máquinas',
                        weights: { PCP: 0, DS: 0, MA: 4 }
                    },
                    {
                        id: 'd',
                        text: 'Função que misture duas dessas áreas',
                        weights: { PCP: 2, DS: 2, MA: 2 }
                    }
                ]
            },
            {
                id: '3.4',
                text: 'Qual valor é mais importante no trabalho?',
                alternatives: [
                    {
                        id: 'a',
                        text: 'Organização e cumprir prazos',
                        weights: { PCP: 4, DS: 1, MA: 0 }
                    },
                    {
                        id: 'b',
                        text: 'Criatividade e inovação técnica',
                        weights: { PCP: 0, DS: 4, MA: 0 }
                    },
                    {
                        id: 'c',
                        text: 'Habilidade manual e solução prática',
                        weights: { PCP: 0, DS: 0, MA: 4 }
                    },
                    {
                        id: 'd',
                        text: 'Segurança e confiabilidade',
                        weights: { PCP: 3, DS: 0, MA: 2 }
                    }
                ]
            }
        ]
    }
]
