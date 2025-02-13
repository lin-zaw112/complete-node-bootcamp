const express = require('express');
const morgan = require('morgan');
const sanitizer = require('perfect-express-sanitizer');
const mongoSanitizer = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// * 1 MIDDLEWARES

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour !',
});
app.use('/api', limiter);
app.use(express.json({ limit: '10kb' }));

app.use(mongoSanitizer());

app.use(
  sanitizer.clean({
    xss: true,
    noSql: true,
    sql: true,
    level: 5,
    forbiddenTags: [/\d=\d/gm, '.execute'],
  })
);
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// * 3  ROUTES

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server ! `, 404));
});

app.use(globalErrorHandler);

module.exports = app;
