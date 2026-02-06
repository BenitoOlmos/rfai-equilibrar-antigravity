import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Crear Programas
    const programaCulpa = await prisma.program.create({
        data: {
            name: 'RFAI Culpa',
            description: 'Tratamiento focalizado en culpa y responsabilidad excesiva.',
            price: 250000
        }
    });

    const programaAngustia = await prisma.program.create({
        data: {
            name: 'RFAI Angustia',
            description: 'Tratamiento focalizado en angustia y crisis de pánico.',
            price: 250000
        }
    });

    const programaIrritabilidad = await prisma.program.create({
        data: {
            name: 'RFAI Irritabilidad',
            description: 'Tratamiento focalizado en manejo de ira, reactividad y control de impulsos.',
            price: 250000
        }
    });

    const programs = {
        'RFAI Culpa': programaCulpa,
        'RFAI Angustia': programaAngustia,
        'RFAI Irritabilidad': programaIrritabilidad
    };

    // 2. Crear Usuarios Staff
    await prisma.user.upsert({
        where: { email: 'admin@equilibrar.cl' },
        update: {},
        create: {
            name: 'Benito Olmos',
            email: 'admin@equilibrar.cl',
            role: 'ADMIN',
            status: 'ACTIVE',
            // No client profile needed for admin in strict logic but types imply hydration options
        }
    });

    await prisma.user.upsert({
        where: { email: 'coord@equilibrar.cl' },
        update: {},
        create: {
            name: 'Sol Elgueta',
            email: 'coord@equilibrar.cl',
            role: 'COORDINATOR',
            status: 'ACTIVE'
        }
    });

    const professional = await prisma.user.upsert({
        where: { email: 'prof@equilibrar.cl' },
        update: {},
        create: {
            name: 'Claudio Reyes',
            email: 'prof@equilibrar.cl',
            role: 'PROFESSIONAL',
            status: 'ACTIVE'
        }
    });

    // 3. Crear Pacientes
    // Datos extraídos de constants.ts
    const patientsData = [
        { name: 'Lucía Fernández Soto', email: 'lucia@client.com', program: 'RFAI Culpa', week: 1, address: 'Av. Providencia 1234, Santiago' },
        { name: 'Carlos Díaz Muñoz', email: 'carlos@client.com', program: 'RFAI Culpa', week: 2, address: 'Calle Falsa 123, Ñuñoa' },
        { name: 'Pedro Pascal Olivo', email: 'pedro@client.com', program: 'RFAI Culpa', week: 3, address: 'Los Leones 45, Providencia' },
        { name: 'Ana Ruiz Tagle', email: 'ana@client.com', program: 'RFAI Culpa', week: 4, address: 'El Bosque 555, Las Condes' },
        { name: 'Paula Angustia Vera', email: 'paula@angustia.com', program: 'RFAI Angustia', week: 1, address: 'Alameda 333, Santiago' },
        { name: 'Jorge Angustia Lagos', email: 'jorge@angustia.com', program: 'RFAI Angustia', week: 2, address: 'Irarrázaval 500, Ñuñoa' },
        { name: 'Camila Angustia Perez', email: 'camila@angustia.com', program: 'RFAI Angustia', week: 3, address: 'Vitacura 9000, Vitacura' },
        { name: 'Luis Angustia Molina', email: 'luis@angustia.com', program: 'RFAI Angustia', week: 4, address: 'Pajaritos 22, Maipú' },
        { name: 'Ignacio Ira Varas', email: 'ignacio@ira.com', program: 'RFAI Irritabilidad', week: 1, address: 'Tobalaba 100, Providencia' },
        { name: 'Isabel Ira Silva', email: 'isabel@ira.com', program: 'RFAI Irritabilidad', week: 2, address: 'Gran Avenida 40, San Miguel' },
        { name: 'Iván Ira Castro', email: 'ivan@ira.com', program: 'RFAI Irritabilidad', week: 3, address: 'Vicuña Mackenna 10, Santiago' },
        { name: 'Irene Ira Rojas', email: 'irene@ira.com', program: 'RFAI Irritabilidad', week: 4, address: 'Apoquindo 3000, Las Condes' }
    ];

    for (const p of patientsData) {
        const user = await prisma.user.create({
            data: {
                name: p.name,
                email: p.email,
                role: 'CLIENT',
                status: 'ACTIVE'
            }
        });

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (p.week * 7)); // Simulando inicio hace N semanas

        // Crear Perfil
        await prisma.clientProfile.create({
            data: {
                userId: user.id,
                currentWeek: p.week,
                startDate: startDate,
                address: p.address
            }
        });

        // Crear Inscripción
        const prog = programs[p.program as keyof typeof programs];
        if (prog) {
            await prisma.inscription.create({
                data: {
                    patientId: user.id,
                    programId: prog.id,
                    startDate: startDate,
                    status: 'active'
                }
            });
        }

        // Crear Progreso Semanal (Mock)
        await prisma.clientWeekProgress.create({
            data: {
                clientId: user.id,
                weekNumber: p.week,
                isLocked: false,
                isCompleted: false,
                initialTestDone: true,
                guideCompleted: p.week > 1, // Si va en semana 2, semana 1 ok (simplificacion)
                audioListenedCount: p.week * 3 // Mock
            }
        });
    }

    console.log('✅ Seed completed');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
