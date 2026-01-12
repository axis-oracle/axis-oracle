import { FC } from 'react';
import { Navigate } from 'react-router-dom';

// Redirect /docs to /docs/intro
const DocsIndex: FC = () => <Navigate to="/docs/intro" replace />;

export default DocsIndex;
