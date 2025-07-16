const db = require('../../models');
// Forma más segura de acceder a los modelos
const Ticket = db.Ticket;
const User = db.User;
const TicketCategory = db.TicketCategory;
const TicketStatus = db.TicketStatus;
const Comment = db.Comment;

// --- 1. CREAR un nuevo ticket (POST /api/tickets) ---
exports.createTicket = async (req, res) => {
  try {
    const { title, description, categoryId } = req.body;
    const creatorId = req.userId; // Obtenido del token JWT

    if (!title || !description || !categoryId) {
      return res.status(400).send({ message: "Título, descripción y categoría son requeridos." });
    }

    // Por defecto, un nuevo ticket siempre empieza con el estado "Abierto".
    // Asumiremos que el ID del estado "Abierto" es 1. (Lo poblaremos con seeders más adelante).
    const openStatus = await TicketStatus.findOne({ where: { name: 'Abierto' } });
    if (!openStatus) {
        // Esto solo pasaría si la DB no tiene los estados iniciales.
        return res.status(500).send({ message: "Estado inicial 'Abierto' no encontrado. Contacte al administrador." });
    }

    const newTicket = await Ticket.create({
      title,
      description,
      categoryId,
      creatorId,
      statusId: openStatus.id, // Asignamos el ID del estado "Abierto"
      assigneeId: null, // Sin asignar al crearse
    });

    res.status(201).send(newTicket);
  } catch (error) {
    console.error("Error al crear el ticket:", error);
    res.status(500).send({ message: "Error en el servidor al crear el ticket." });
  }
};

// --- 2. OBTENER tickets (GET /api/tickets) ---
exports.getTickets = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    let tickets;

    const includeOptions = [
        { model: TicketStatus, as: 'status', attributes: ['id', 'name'] },
        { model: TicketCategory, as: 'category', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'name'] },
    ];

    if (user.role === 'admin') {
      // Si es admin, obtiene todos los tickets
      tickets = await Ticket.findAll({
        include: includeOptions,
        order: [['createdAt', 'DESC']],
      });
    } else {
      // Si es employee, obtiene solo los tickets creados por él
      tickets = await Ticket.findAll({
        where: { creatorId: req.userId },
        include: includeOptions,
        order: [['createdAt', 'DESC']],
      });
    }

    res.status(200).send(tickets);
  } catch (error) {
    console.error("Error al obtener los tickets:", error);
    res.status(500).send({ message: "Error en el servidor al obtener los tickets." });
  }
};

// --- 3. OBTENER un ticket por su ID (GET /api/tickets/:id) ---
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [
        { model: TicketStatus, as: 'status' },
        { model: TicketCategory, as: 'category' },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        {
          model: Comment,
          as: 'comments',
          include: [{ model: User, as: 'author', attributes: ['id', 'name', 'role'] }]
        }
      ],
      order: [[{ model: Comment, as: 'comments' }, 'createdAt', 'ASC']] // Ordenar comentarios del más antiguo al más nuevo
    });

    if (!ticket) {
      return res.status(404).send({ message: "Ticket no encontrado." });
    }

    // Opcional: Lógica de seguridad para que solo el creador o un admin puedan verlo
    const user = await User.findByPk(req.userId);
    if (user.role !== 'admin' && ticket.creatorId !== user.id) {
        return res.status(403).send({ message: "Acceso denegado." });
    }

    res.status(200).send(ticket);
  } catch (error) {
    console.error("Error al obtener el ticket por ID:", error);
    res.status(500).send({ message: "Error en el servidor." });
  }
};

// --- 4. AÑADIR un comentario a un ticket (POST /api/tickets/:id/comments) ---
exports.addComment = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const userId = req.userId;
        const { content } = req.body;

        if (!content) {
            return res.status(400).send({ message: "El contenido del comentario no puede estar vacío." });
        }

        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket) {
            return res.status(404).send({ message: "Ticket no encontrado." });
        }

        const newComment = await Comment.create({
            content,
            ticketId: ticket.id,
            userId
        });

        // Opcional: Devolver el comentario creado con la información del autor
        const commentWithAuthor = await Comment.findByPk(newComment.id, {
            include: [{ model: User, as: 'author', attributes: ['id', 'name', 'role'] }]
        });

        res.status(201).send(commentWithAuthor);
    } catch (error) {
        console.error("Error al añadir comentario:", error);
        res.status(500).send({ message: "Error en el servidor al añadir comentario." });
    }
};

// --- 5. ACTUALIZAR estado o asignado de un ticket (PUT /api/tickets/:id) ---
// Esta función será solo para administradores
exports.updateTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const { statusId, assigneeId } = req.body;

        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket) {
            return res.status(404).send({ message: "Ticket no encontrado." });
        }
        
        // Creamos un objeto con los campos a actualizar
        const updateData = {};
        if (statusId) updateData.statusId = statusId;
        // Permitimos des-asignar un ticket pasando null
        if (assigneeId !== undefined) updateData.assigneeId = assigneeId;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).send({ message: "No se proporcionaron datos para actualizar." });
        }

        await ticket.update(updateData);

        // Devolvemos el ticket actualizado con todas sus relaciones
        const updatedTicket = await Ticket.findByPk(ticketId, {
            include: [
                { model: TicketStatus, as: 'status' },
                { model: TicketCategory, as: 'category' },
                { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
            ]
        });

        res.status(200).send(updatedTicket);

    } catch (error) {
        console.error("Error al actualizar el ticket:", error);
        res.status(500).send({ message: "Error en el servidor al actualizar el ticket." });
    }
};
/*
// --- 5. ACTUALIZAR estado o asignado de un ticket (VERSIÓN DE DEPURACIÓN) ---
exports.updateTicket = async (req, res) => {
    // ---- INICIO DEL CÓDIGO DE DEPURACIÓN ----
    console.log('--- DENTRO DE updateTicket ---');
    console.log('Tipo de req.body:', typeof req.body);
    console.log('Contenido de req.body:', req.body);
    console.log('Headers de la petición:', req.headers);
    
    if (!req.body) {
        return res.status(500).send({ 
            message: "ERROR DE SERVIDOR: req.body es undefined.",
            tipo: typeof req.body
        });
    }
    
    res.status(200).send({ 
        message: "Llegué a la función de actualización. Esto es lo que recibí.",
        body_recibido: req.body
    });
    // ---- FIN DEL CÓDIGO DE DEPURACIÓN ----
};
*/