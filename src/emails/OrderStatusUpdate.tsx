import React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from '@react-email/components';

interface OrderStatusUpdateProps {
  orderId: string;
  status: string;
}

const statusMessages: Record<string, { title: string; message: string }> = {
  confirmed: {
    title: 'Commande confirmée',
    message: 'Votre commande a été confirmée et est en cours de préparation.',
  },
  processing: {
    title: 'Commande en cours de préparation',
    message: 'Nous préparons actuellement votre commande avec soin.',
  },
  shipped: {
    title: 'Commande expédiée !',
    message: 'Bonne nouvelle ! Votre commande vient d\'être expédiée. Elle est en route vers chez vous.',
  },
  delivered: {
    title: 'Commande livrée',
    message: 'Votre commande a été livrée. Nous espérons que vous apprécierez vos produits HB Service !',
  },
  cancelled: {
    title: 'Commande annulée',
    message: 'Votre commande a été annulée. Si vous avez des questions, n\'hésitez pas à nous contacter.',
  },
};

export const OrderStatusUpdateEmail = ({
  orderId,
  status,
}: OrderStatusUpdateProps) => {
  const content = statusMessages[status] || {
    title: 'Mise à jour de votre commande',
    message: 'Le statut de votre commande a été mis à jour.',
  };

  return (
    <Html>
      <Head />
      <Preview>{content.title} - HB Service</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{content.title}</Heading>
          
          <Text style={text}>
            Bonjour,
          </Text>
          <Text style={text}>
            Concernant votre commande <strong>#{orderId.slice(-8).toUpperCase()}</strong> :
          </Text>
          <Text style={highlightText}>
            {content.message}
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Si vous avez des questions, n'hésitez pas à nous contacter sur WhatsApp au +221 77 875 74 74.
            <br />
            L'équipe HB_Service
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderStatusUpdateEmail;

const main = {
  backgroundColor: '#F8F7F5',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: '1px solid #E8E0D5',
  overflow: 'hidden',
  marginTop: '40px',
  marginBottom: '40px',
  paddingLeft: '40px',
  paddingRight: '40px',
};

const h1 = {
  color: '#1A1A1A',
  fontSize: '24px',
  fontWeight: 'bold',
  paddingTop: '32px',
  paddingBottom: '32px',
  margin: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#444444',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
};

const highlightText = {
  color: '#1A1A1A',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  fontWeight: 'bold',
  backgroundColor: '#F5F0E8',
  padding: '16px',
  borderRadius: '4px',
};

const hr = {
  borderColor: '#E8E0D5',
  margin: '32px 0 0 0',
};

const footer = {
  color: '#8C8C8C',
  fontSize: '12px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  marginTop: '32px',
};
